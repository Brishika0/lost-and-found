import React, { useState } from "react";
import { Shield, Plus, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetCollegeAdmins } from "@/hooks/useUsers";
import { useAddCollegeAdmin, useRemoveCollegeAdmin } from "@/hooks/useColleges";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminsTabProps {
  collegeId: string;
}

export const AdminsTab: React.FC<AdminsTabProps> = ({ collegeId }) => {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");

  const {
    data: adminsData,
    isLoading,
    isError,
  } = useGetCollegeAdmins({
    collegeId,
  });

  const addAdmin = useAddCollegeAdmin();
  const removeAdmin = useRemoveCollegeAdmin();

  const admins = adminsData?.data;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <p>Errorrr</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>College Administrators</CardTitle>
          <CardDescription>
            Manage administrators for the college
          </CardDescription>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Paste the user id of the account that you want to promot to
                college_admin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="text"
                placeholder="Paste user id in here..."
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <Button
              onClick={async () => {
                await addAdmin.mutate({ collegeId, adminId: userId });
              }}
              disabled={!userId || addAdmin.isPending}
            >
              {addAdmin.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {admins !== undefined && admins.length > 0 ? (
          <div className="space-y-4">
            {admins?.map((admin) => (
              <div
                key={admin._id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={admin.avatar} />
                    <AvatarFallback>
                      {admin.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{admin.name}</p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                    <div className="mt-1 flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {admin.role}
                      </Badge>
                      {admin.lastActive && (
                        <span className="text-xs text-gray-400">
                          Last active:{" "}
                          {new Date(admin.lastActive).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    await removeAdmin.mutate({ collegeId, adminId: admin._id });
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Shield className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No administrators assigned yet</p>
            <Button variant="link" className="mt-2">
              Add your first admin
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
