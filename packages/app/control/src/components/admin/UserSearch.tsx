'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/client';
import { User } from '@/generated/prisma';
import { Search, Mail, User as UserIcon, Calendar } from 'lucide-react';

interface UserSearchProps {
  selectedUser: User | null;
  onUserSelect: (user: User | null) => void;
}

export function UserSearch({ selectedUser, onUserSelect }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: users, isLoading } = api.admin.getUsers.useQuery();

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!users || !searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    return users.filter(
      user =>
        user.email?.toLowerCase().includes(term) ||
        user.name?.toLowerCase().includes(term) ||
        user.id.includes(term)
    );
  }, [users, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setShowResults(value.length > 0);
  };

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setSearchTerm('');
    setShowResults(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search users by email, name, or ID..."
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected User Display */}
      {selectedUser && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {selectedUser.name || 'No name'}
                    </span>
                    {selectedUser.admin && (
                      <Badge variant="secondary" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {selectedUser.email}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Joined {formatDate(selectedUser.createdAt)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUserSelect(null)}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="border rounded-lg divide-y">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {user.name || 'No name'}
                      </span>
                      {user.admin && (
                        <Badge variant="secondary" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {user.id} • Joined {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No users found matching &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {users && !showResults && (
        <div className="text-sm text-muted-foreground">
          Total users: {users.length}
        </div>
      )}
    </div>
  );
}
