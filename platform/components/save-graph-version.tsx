import { Save } from "lucide-react";
import { Button } from "./ui/button";
import { Toast } from "radix-ui";
import { useRef, useState } from "react";

import "../styles/SaveGraphVersion.css";
import { v4 } from "uuid";

export function SaveGraphVersion(){

  const [open, setOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const [savedGraphId, setSavedGraphId] = useState<string>("");

  const saveGraphVersion = () => {
    console.log("Save Graph Version");
    setSavedGraphId(v4());
    setOpen(false);
    globalThis.clearTimeout(timerRef.current);
    timerRef.current = globalThis.setTimeout(() => {
      setOpen(true);
    }, 100);
  }

  return (
    <Toast.Provider swipeDirection="right">
      <Button
        className="order-2 ml-auto h-8 px-2 md:order-1 md:ml-0 md:h-fit md:px-2"
        variant="outline"
        onClick={saveGraphVersion}
      >
        <Save/>
        <span className="md:sr-only">Save Graph Version</span>
      </Button>
      <Toast.Root className="ToastRoot bg-neutral-50 dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-800" open={open} onOpenChange={setOpen}>
				<Toast.Title className="ToastTitle text-zinc-900 dark:text-zinc-200">Graph saved has been saved 😄</Toast.Title>
				<Toast.Description className="ToastDescription">
					with id: {savedGraphId}
				</Toast.Description>
				{/* <Toast.Action
					className="ToastAction"
					asChild
					altText="Goto schedule to undo"
				>
					<button className="Button small green">sd</button>
				</Toast.Action> */}
			</Toast.Root>
			<Toast.Viewport className="ToastViewport" />
    </Toast.Provider>
  )
}