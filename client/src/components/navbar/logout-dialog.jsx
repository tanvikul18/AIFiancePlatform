import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog.jsx";
import { DialogContent,DialogDescription } from "../ui/dialog.jsx";
import { Loader } from "lucide-react";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { useAppDispatch } from "../../app/hooks.js";
import { logout } from "../../features/auth/authSlice.js";
import { useNavigate } from "react-router-dom";
import { AUTH_ROUTES } from "../../routes/common/routePath";


const LogoutDialog = ({ isOpen, setIsOpen }) => {
    const [isPending, startTransition] = useTransition();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
      startTransition(() => {
        setIsOpen(false);
        dispatch(logout());
        navigate(AUTH_ROUTES.SIGN_IN);
      });
    };
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to log out?</DialogTitle>
            <DialogDescription>
              This will end your current session and you will need to log in
              again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="text-white !bg-red-500" disabled={isPending} type="button" onClick={handleLogout}>
              {isPending && <Loader className="animate-spin" />}
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
}

export default LogoutDialog