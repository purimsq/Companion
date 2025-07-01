import {
  users, units, documents, notes, summaries, assignments, studyPlanEntries, studySessions, chatMessages,
  type User, type Unit, type Document, type Note, type Summary, type Assignment, type StudyPlanEntry, type StudySession, type ChatMessage,
  type InsertUser, type InsertUnit, type InsertDocument, type InsertNote, type InsertSummary, type InsertAssignment, type InsertStudyPlanEntry, type InsertStudySession, type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPace(userId: number, pace: number): Promise<User>;

  // Units
  getUnits(userId: number): Promise<Unit[]>;
  getUnit(id: number): Promise<Unit | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  deleteUnit(id: number): Promise<void>;

  // Documents
  getDocuments(unitId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<void>;

  // Notes
  getNotes(unitId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, content: string): Promise<Note>;
  deleteNote(id: number): Promise<void>;

  // Summaries
  getSummaries(userId: number): Promise<Summary[]>;
  getSummary(id: number): Promise<Summary | undefined>;
  createSummary(summary: InsertSummary): Promise<Summary>;
  approveSummary(id: number): Promise<Summary>;
  deleteSummary(id: number): Promise<void>;

  // Assignments
  getAssignments(userId: number): Promise<Assignment[]>;
  getAssignment(id: number): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: number, updates: Partial<Assignment>): Promise<Assignment>;
  deleteAssignment(id: number): Promise<void>;

  // Study Plan
  getStudyPlan(userId: number, date?: string): Promise<StudyPlanEntry[]>;
  getStudyPlanEntry(id: number): Promise<StudyPlanEntry | undefined>;
  createStudyPlanEntry(entry: InsertStudyPlanEntry): Promise<StudyPlanEntry>;
  completeStudyPlanEntry(id: number): Promise<StudyPlanEntry>;
  deleteStudyPlanEntry(id: number): Promise<void>;

  // Study Sessions
  getStudySessions(userId: number, limit?: number): Promise<StudySession[]>;
  getTodayStudySession(userId: number, date: string): Promise<StudySession | undefined>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: number, updates: Partial<StudySession>): Promise<StudySession>;

  // Chat Messages
  getChatMessages(userId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private units: Map<number, Unit> = new Map();
  private documents: Map<number, Document> = new Map();
  private notes: Map<number, Note> = new Map();
  private summaries: Map<number, Summary> = new Map();
  private assignments: Map<number, Assignment> = new Map();
  private studyPlanEntries: Map<number, StudyPlanEntry> = new Map();
  private studySessions: Map<number, StudySession> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  
  private currentId = 1;

  constructor() {
    // Initialize with Mitchell as the default user
    this.createUser({
      username: "mitch",
      name: "Mitchell",
      pace: 40
    }).then(user => {
      // Create default units
      this.createUnit({
        name: "Anatomy",
        description: "Human body systems and structures",
        color: "#8FBC8F",
        userId: user.id
      });
      this.createUnit({
        name: "Immunology", 
        description: "Immune system and defense mechanisms",
        color: "#DAA520",
        userId: user.id
      });
      this.createUnit({
        name: "Physiology",
        description: "Body functions and processes", 
        color: "#B8B8B8",
        userId: user.id
      });
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPace(userId: number, pace: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, pace };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Units
  async getUnits(userId: number): Promise<Unit[]> {
    return Array.from(this.units.values()).filter(unit => unit.userId === userId);
  }

  async getUnit(id: number): Promise<Unit | undefined> {
    return this.units.get(id);
  }

  async createUnit(insertUnit: InsertUnit): Promise<Unit> {
    const id = this.currentId++;
    const unit: Unit = {
      ...insertUnit,
      id,
      createdAt: new Date()
    };
    this.units.set(id, unit);
    return unit;
  }

  async deleteUnit(id: number): Promise<void> {
    this.units.delete(id);
  }

  // Documents
  async getDocuments(unitId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.unitId === unitId);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentId++;
    const document: Document = {
      ...insertDocument,
      id,
      createdAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: number): Promise<void> {
    this.documents.delete(id);
  }

  // Notes
  async getNotes(unitId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.unitId === unitId);
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentId++;
    const note: Note = {
      ...insertNote,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, content: string): Promise<Note> {
    const note = this.notes.get(id);
    if (!note) throw new Error("Note not found");
    const updatedNote = { ...note, content, updatedAt: new Date() };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<void> {
    this.notes.delete(id);
  }

  // Summaries
  async getSummaries(userId: number): Promise<Summary[]> {
    return Array.from(this.summaries.values()).filter(summary => summary.userId === userId);
  }

  async getSummary(id: number): Promise<Summary | undefined> {
    return this.summaries.get(id);
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const id = this.currentId++;
    const summary: Summary = {
      ...insertSummary,
      id,
      createdAt: new Date()
    };
    this.summaries.set(id, summary);
    return summary;
  }

  async approveSummary(id: number): Promise<Summary> {
    const summary = this.summaries.get(id);
    if (!summary) throw new Error("Summary not found");
    const updatedSummary = { ...summary, approved: true };
    this.summaries.set(id, updatedSummary);
    return updatedSummary;
  }

  async deleteSummary(id: number): Promise<void> {
    this.summaries.delete(id);
  }

  // Assignments
  async getAssignments(userId: number): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).filter(assignment => assignment.userId === userId);
  }

  async getAssignment(id: number): Promise<Assignment | undefined> {
    return this.assignments.get(id);
  }

  async createAssignment(insertAssignment: InsertAssignment): Promise<Assignment> {
    const id = this.currentId++;
    const assignment: Assignment = {
      ...insertAssignment,
      id,
      createdAt: new Date()
    };
    this.assignments.set(id, assignment);
    return assignment;
  }

  async updateAssignment(id: number, updates: Partial<Assignment>): Promise<Assignment> {
    const assignment = this.assignments.get(id);
    if (!assignment) throw new Error("Assignment not found");
    const updatedAssignment = { ...assignment, ...updates };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  async deleteAssignment(id: number): Promise<void> {
    this.assignments.delete(id);
  }

  // Study Plan
  async getStudyPlan(userId: number, date?: string): Promise<StudyPlanEntry[]> {
    const entries = Array.from(this.studyPlanEntries.values()).filter(entry => entry.userId === userId);
    if (date) {
      return entries.filter(entry => entry.scheduledDate.toISOString().split('T')[0] === date);
    }
    return entries;
  }

  async getStudyPlanEntry(id: number): Promise<StudyPlanEntry | undefined> {
    return this.studyPlanEntries.get(id);
  }

  async createStudyPlanEntry(insertEntry: InsertStudyPlanEntry): Promise<StudyPlanEntry> {
    const id = this.currentId++;
    const entry: StudyPlanEntry = {
      ...insertEntry,
      id,
      createdAt: new Date()
    };
    this.studyPlanEntries.set(id, entry);
    return entry;
  }

  async completeStudyPlanEntry(id: number): Promise<StudyPlanEntry> {
    const entry = this.studyPlanEntries.get(id);
    if (!entry) throw new Error("Study plan entry not found");
    const updatedEntry = { ...entry, completed: true };
    this.studyPlanEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteStudyPlanEntry(id: number): Promise<void> {
    this.studyPlanEntries.delete(id);
  }

  // Study Sessions
  async getStudySessions(userId: number, limit = 30): Promise<StudySession[]> {
    return Array.from(this.studySessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async getTodayStudySession(userId: number, date: string): Promise<StudySession | undefined> {
    return Array.from(this.studySessions.values())
      .find(session => session.userId === userId && session.date === date);
  }

  async createStudySession(insertSession: InsertStudySession): Promise<StudySession> {
    const id = this.currentId++;
    const session: StudySession = {
      ...insertSession,
      id,
      createdAt: new Date()
    };
    this.studySessions.set(id, session);
    return session;
  }

  async updateStudySession(id: number, updates: Partial<StudySession>): Promise<StudySession> {
    const session = this.studySessions.get(id);
    if (!session) throw new Error("Study session not found");
    const updatedSession = { ...session, ...updates };
    this.studySessions.set(id, updatedSession);
    return updatedSession;
  }

  // Chat Messages
  async getChatMessages(userId: number, limit = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime())
      .slice(-limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
