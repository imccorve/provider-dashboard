"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface NavigationBarProps {
  rightContent?: React.ReactNode;
  containerWidth?: "max-w-3xl" | "max-w-7xl";
}

export function NavigationBar({
  rightContent,
  containerWidth = "max-w-3xl",
}: NavigationBarProps) {
  const router = useRouter();

  return (
    <div className="bg-white border-b">
      <div className={`${containerWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex justify-between items-center h-16">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
          {rightContent}
        </div>
      </div>
    </div>
  );
}