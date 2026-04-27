import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const HomePage = () => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-svh w-svw items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh min-w-svw flex-col items-center justify-center space-y-5 text-2xl text-black">
      <p>
        User Loggedin:{" "}
        {user ? (
          <Badge variant="success">Yes logged in</Badge>
        ) : (
          <Badge variant="destructive">No user found</Badge>
        )}
      </p>
      {user ? (
        <>
          <Button>
            <Link to="/profile">See Profile</Link>
          </Button>
          <Button onClick={() => logout()}>Logout</Button>
        </>
      ) : (
        <Button>
          <Link to="/login">Login</Link>
        </Button>
      )}
    </div>
  );
};

export default HomePage;
