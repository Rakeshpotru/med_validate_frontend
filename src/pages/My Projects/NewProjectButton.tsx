import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/button";

export function NewProjectButton() {
  const navigate = useNavigate();

  const createProject = () => {
    navigate("/projects/create");
  };

  return (
    <Button
      onClick={createProject}
      className="bg-[#1f3a9d] hover:bg-[#1f3a9d]/90 text-white flex items-center gap-2"
      aria-label="Create new project"
    >
      <Plus className="h-4 w-4" />
      New Project
    </Button>
  );
}
