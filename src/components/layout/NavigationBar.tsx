import { themeAtom } from "@/common/atoms";
import { useAtom } from "jotai";
import { Moon, Sun } from "lucide-react";

export default function NavigationBar() {
  const [theme, setTheme] = useAtom(themeAtom);

  return (
    <nav className="navbar border-bottom border-body px-4 shadow-lg">
      <div className="container-fluid">
        <a className="navbar-brand fw-bolder text-secondary" href="">
          r-Dynamic Graph Coloring Tool
        </a>

        <div>
          <button
            className={theme === "dark" ? "btn btn-light" : "btn btn-dark"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun/> : <Moon/>}
          </button>
        </div>
      </div>
    </nav>
  );
}
