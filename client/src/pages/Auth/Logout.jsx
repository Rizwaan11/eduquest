import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { googleLogout } from "@react-oauth/google";
import { authLogout } from "../../features/auth/authSlice";
import api from "../../features/auth/authApi";

export default function LogoutButton({ className }) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      googleLogout();
      queryClient.clear();
      dispatch(authLogout());
    } catch (err) {
      console.log(err);
    }
  };

  return <button className={className} onClick={handleLogout}>Logout</button>;
}
