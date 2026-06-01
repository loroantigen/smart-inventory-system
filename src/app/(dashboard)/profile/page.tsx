"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  User,
  Mail,
  Building,
  Shield,
  Edit,
  Save,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      await update({ name });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-medium">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold">{session?.user?.name || "User"}</h2>
              <p className="text-gray-500">{session?.user?.email}</p>
              <Badge className="mt-1">{session?.user?.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Account Information</span>
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              Full Name
            </Label>
            {isEditing ? (
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            ) : (
              <p className="text-sm text-gray-600">{session?.user?.name || "N/A"}</p>
            )}
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              Email Address
            </Label>
            <p className="text-sm text-gray-600">{session?.user?.email}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-400" />
              Role
            </Label>
            <p className="text-sm text-gray-600">{session?.user?.role}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-400" />
              Department
            </Label>
            <p className="text-sm text-gray-600">{session?.user?.departmentName || "N/A"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}