import { useQuery } from "@tanstack/react-query";

interface User {
  id: number;
  username: string;
  name: string;
  pace: number;
  createdAt: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
