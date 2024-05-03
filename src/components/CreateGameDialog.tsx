import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";

interface CreateGameDialogProps {
  isOpen: boolean;
  handleClose: () => void;
}

function CreateGameDialog({ isOpen, handleClose }: CreateGameDialogProps) {
  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Create New Game</DialogTitle>
    </Dialog>
  );
}

export default CreateGameDialog;
