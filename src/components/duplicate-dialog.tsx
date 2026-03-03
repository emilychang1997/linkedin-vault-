"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchedPost: {
    id: number;
    ogTitle: string | null;
    linkedinUrl: string;
  };
  matchType: "exact" | "similar";
  message: string;
  onKeep: () => void;
  onSkip: () => void;
}

export function DuplicateDialog({
  open,
  onOpenChange,
  matchedPost,
  matchType,
  message,
  onKeep,
  onSkip,
}: DuplicateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <DialogTitle>Possible Duplicate Detected</DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="bg-zinc-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-zinc-700 mb-2">Existing Post:</p>
            <p className="text-sm text-zinc-900 font-medium">
              {matchedPost.ogTitle || "Untitled Post"}
            </p>
            <a
              href={matchedPost.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:underline mt-1 block"
              style={{ color: "#0B66C2" }}
            >
              View original post
            </a>
          </div>

          <p className="text-sm text-zinc-600">
            {matchType === "exact"
              ? "This appears to be the exact same post."
              : "This appears to be very similar to an existing post."}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onSkip}>
            Skip - Don't Save
          </Button>
          <Button
            onClick={onKeep}
            style={{ backgroundColor: "#0B66C2" }}
            className="text-white"
          >
            Keep - Save Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
