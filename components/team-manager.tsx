"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react";

interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  members: number;
  createdAt: Date;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  joinedAt: Date;
}

export function TeamManager() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName }),
      });
      
      if (response.ok) {
        const team = await response.json();
        setTeams([...teams, team]);
        setNewTeamName("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !newMemberEmail.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newMemberEmail, role: "member" }),
      });
      
      if (response.ok) {
        const member = await response.json();
        setMembers([...members, member]);
        setNewMemberEmail("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam) return;
    
    setIsLoading(true);
    try {
      await fetch(`/api/teams/${selectedTeam.id}/members/${memberId}`, {
        method: "DELETE",
      });
      setMembers(members.filter((m) => m.id !== memberId));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Team Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create Team</CardTitle>
          <CardDescription>Create a new team to collaborate with others</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Team name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
          />
          <Button onClick={handleCreateTeam} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create
          </Button>
        </CardContent>
      </Card>

      {/* Teams List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Teams</CardTitle>
          <CardDescription>{teams.length} team(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {teams.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTeam(t)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedTeam?.id === t.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.members} members</p>
                  </div>
                  <Badge variant="outline">{t.slug}</Badge>
                </div>
              </div>
            ))}
            {teams.length === 0 && (
              <p className="text-center text-gray-500 py-8">No teams yet. Create one to get started!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Members Section */}
      {selectedTeam && (
        <Card>
          <CardHeader>
            <CardTitle>Team Members - {selectedTeam.name}</CardTitle>
            <CardDescription>Manage team membership and roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Member Form */}
            <div className="flex gap-2">
              <Input
                placeholder="Member email"
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
              <Button onClick={handleAddMember} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Add
              </Button>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={member.role === "admin" ? "default" : "secondary"}
                    >
                      {member.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-center text-gray-500 py-8">No members yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
