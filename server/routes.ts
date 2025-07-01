import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./services/ai";
import { documentProcessor } from "./services/pdf";
import { insertUnitSchema, insertDocumentSchema, insertNoteSchema, insertSummarySchema, insertAssignmentSchema, insertStudyPlanEntrySchema, insertChatMessageSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  const CURRENT_USER_ID = 1; // Mitchell's user ID

  // Get current user
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(CURRENT_USER_ID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user pace
  app.patch("/api/user/pace", async (req, res) => {
    try {
      const { pace } = req.body;
      if (typeof pace !== "number" || pace < 1 || pace > 80) {
        return res.status(400).json({ message: "Pace must be a number between 1 and 80" });
      }
      const user = await storage.updateUserPace(CURRENT_USER_ID, pace);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Units
  app.get("/api/units", async (req, res) => {
    try {
      const units = await storage.getUnits(CURRENT_USER_ID);
      
      // Enhance units with progress data
      const enhancedUnits = await Promise.all(units.map(async (unit) => {
        const documents = await storage.getDocuments(unit.id);
        const notes = await storage.getNotes(unit.id);
        
        // Calculate some basic progress metrics
        const totalTopics = Math.max(documents.length * 2, 5); // Assume 2 topics per document, minimum 5
        const completedTopics = Math.floor(Math.random() * totalTopics); // Mock progress
        
        return {
          ...unit,
          documentsCount: documents.length,
          notesCount: notes.length,
          totalTopics,
          completedTopics,
          progressPercentage: Math.round((completedTopics / totalTopics) * 100),
          lastStudied: documents.length > 0 ? "2 days ago" : "Not started"
        };
      }));
      
      res.json(enhancedUnits);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/units", async (req, res) => {
    try {
      const unitData = insertUnitSchema.parse({
        ...req.body,
        userId: CURRENT_USER_ID
      });
      const unit = await storage.createUnit(unitData);
      res.json(unit);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/units/:id", async (req, res) => {
    try {
      await storage.deleteUnit(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Documents
  app.get("/api/units/:unitId/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments(parseInt(req.params.unitId));
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/units/:unitId/documents", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const unitId = parseInt(req.params.unitId);
      const { buffer, originalname, mimetype } = req.file;

      // Validate file type
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mimetype)) {
        return res.status(400).json({ message: "Only PDF and DOCX files are supported" });
      }

      // Process file
      const fileInfo = documentProcessor.getFileInfo(buffer, originalname, mimetype);
      const filepath = await documentProcessor.saveFile(buffer, fileInfo.filename);
      
      // Extract text
      let extractedText = "";
      try {
        const extracted = await documentProcessor.extractText(filepath, mimetype);
        extractedText = extracted.text;
      } catch (error) {
        console.warn("Text extraction failed:", error.message);
      }

      // Save to storage
      const document = await storage.createDocument({
        ...fileInfo,
        extractedText,
        unitId,
        userId: CURRENT_USER_ID
      });

      res.json(document);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      await storage.deleteDocument(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Notes
  app.get("/api/units/:unitId/notes", async (req, res) => {
    try {
      const notes = await storage.getNotes(parseInt(req.params.unitId));
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/units/:unitId/notes", async (req, res) => {
    try {
      const noteData = insertNoteSchema.parse({
        ...req.body,
        unitId: parseInt(req.params.unitId),
        userId: CURRENT_USER_ID
      });
      const note = await storage.createNote(noteData);
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const { content } = req.body;
      const note = await storage.updateNote(parseInt(req.params.id), content);
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      await storage.deleteNote(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Summaries
  app.post("/api/documents/:documentId/summary", async (req, res) => {
    try {
      const document = await storage.getDocument(parseInt(req.params.documentId));
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (!document.extractedText) {
        return res.status(400).json({ message: "No text available for summarization" });
      }

      const summary = await aiService.generateSummary({
        text: document.extractedText,
        context: `Document: ${document.originalName}`,
        maxLength: 500
      });

      const savedSummary = await storage.createSummary({
        content: summary,
        documentId: document.id,
        unitId: document.unitId,
        userId: CURRENT_USER_ID,
        approved: false
      });

      res.json(savedSummary);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/summaries/:id/approve", async (req, res) => {
    try {
      const summary = await storage.approveSummary(parseInt(req.params.id));
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/summaries/:id", async (req, res) => {
    try {
      await storage.deleteSummary(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Assignments
  app.get("/api/assignments", async (req, res) => {
    try {
      const assignments = await storage.getAssignments(CURRENT_USER_ID);
      
      // Sort by deadline and add urgency info
      const enhancedAssignments = assignments.map(assignment => {
        const daysUntilDue = Math.ceil((assignment.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...assignment,
          daysUntilDue,
          urgency: daysUntilDue <= 2 ? "high" : daysUntilDue <= 7 ? "medium" : "low"
        };
      }).sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
      
      res.json(enhancedAssignments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/assignments", async (req, res) => {
    try {
      const assignmentData = insertAssignmentSchema.parse({
        ...req.body,
        userId: CURRENT_USER_ID,
        deadline: new Date(req.body.deadline)
      });
      const assignment = await storage.createAssignment(assignmentData);
      res.json(assignment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/assignments/:id", async (req, res) => {
    try {
      const updates = req.body;
      if (updates.deadline) {
        updates.deadline = new Date(updates.deadline);
      }
      const assignment = await storage.updateAssignment(parseInt(req.params.id), updates);
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/assignments/:id", async (req, res) => {
    try {
      await storage.deleteAssignment(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Study Plan
  app.get("/api/study-plan", async (req, res) => {
    try {
      const date = req.query.date as string;
      const entries = await storage.getStudyPlan(CURRENT_USER_ID, date);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/study-plan", async (req, res) => {
    try {
      const entryData = insertStudyPlanEntrySchema.parse({
        ...req.body,
        userId: CURRENT_USER_ID,
        scheduledDate: new Date(req.body.scheduledDate)
      });
      const entry = await storage.createStudyPlanEntry(entryData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/study-plan/:id/complete", async (req, res) => {
    try {
      const entry = await storage.completeStudyPlanEntry(parseInt(req.params.id));
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Chat
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(CURRENT_USER_ID, 50);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      // Save user message
      await storage.createChatMessage({
        content: message,
        role: "user",
        userId: CURRENT_USER_ID
      });

      // Get conversation history
      const recentMessages = await storage.getChatMessages(CURRENT_USER_ID, 10);
      const conversationHistory = recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate AI response
      const aiResponse = await aiService.chat(message, conversationHistory);

      // Save AI response
      const savedResponse = await storage.createChatMessage({
        content: aiResponse.content,
        role: "assistant",
        userId: CURRENT_USER_ID
      });

      res.json({
        message: savedResponse,
        suggestions: aiResponse.suggestions
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard Data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const user = await storage.getUser(CURRENT_USER_ID);
      
      // Get today's study plan
      const todaysPlan = await storage.getStudyPlan(CURRENT_USER_ID, today);
      const completedToday = todaysPlan.filter(entry => entry.completed).length;
      const totalToday = todaysPlan.length;
      
      // Get study streak
      const recentSessions = await storage.getStudySessions(CURRENT_USER_ID, 30);
      let streak = 0;
      let currentDate = new Date();
      
      for (let i = 0; i < 30; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const hasSession = recentSessions.some(session => session.date === dateStr && session.topicsCompleted > 0);
        
        if (hasSession) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      // Get upcoming assignments
      const assignments = await storage.getAssignments(CURRENT_USER_ID);
      const upcomingAssignments = assignments
        .filter(a => a.deadline > new Date() && !a.completed)
        .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
        .slice(0, 3);
      
      // Get next study session
      const nextSession = todaysPlan
        .filter(entry => !entry.completed)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

      res.json({
        user,
        todaysProgress: {
          completed: completedToday,
          total: totalToday,
          percentage: totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0
        },
        studyStreak: streak,
        nextSession,
        upcomingAssignments
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Study session tracking
  app.post("/api/study-sessions", async (req, res) => {
    try {
      const { date, minutesStudied, topicsCompleted } = req.body;
      
      // Check if session exists for today
      const existingSession = await storage.getTodayStudySession(CURRENT_USER_ID, date);
      
      if (existingSession) {
        // Update existing session
        const updatedSession = await storage.updateStudySession(existingSession.id, {
          minutesStudied: existingSession.minutesStudied + minutesStudied,
          topicsCompleted: existingSession.topicsCompleted + topicsCompleted
        });
        res.json(updatedSession);
      } else {
        // Create new session
        const session = await storage.createStudySession({
          date,
          minutesStudied,
          topicsCompleted,
          userId: CURRENT_USER_ID
        });
        res.json(session);
      }
      
      // Check if user needs a break
      const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const breakSuggestion = await aiService.checkForBreakSuggestion(minutesStudied, dayOfWeek);
      
      if (breakSuggestion) {
        res.json({ ...res.json, breakSuggestion });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
