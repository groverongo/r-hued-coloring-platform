import { MouseEventHandler, useEffect, useMemo, useState } from "react";
import { Dialog } from "radix-ui";
import { useElementRef } from "@/common/refs";
import { obtainAdjacencyList } from "@/common/utilities";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { R_HUED_COLORING_API } from "@/common/query";
import {
  ColoringAssigmentResponse,
  ColoringAssigmentResponseSchema,
} from "@/common/validation";
import { X } from 'lucide-react';
import path from "path/posix";

export const ColoringModal = () => {
  const [open, setOpen] = useState(false);

  const [k, setK] = useState(4);
  const [r, setR] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.shiftKey) && e.key === "C") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { nodesRefs, linksRefs } = useElementRef();

  const queryKey = useMemo(() => ["color-assignment"], []);

  const { refetch, data, isLoading, error } = useQuery({
    queryKey,
    enabled: false,
    retry: false,
    queryFn: async (): Promise<ColoringAssigmentResponse> => {
      const adjacencyList = obtainAdjacencyList(
        nodesRefs.current,
        linksRefs.current
      );
      const response = await axios.post(
        `${R_HUED_COLORING_API}/assign-coloring`,
        { graph: adjacencyList, method: "ACR", k, r },
        {
          responseType: "json",
          headers: {
            "Content-Type": "application/json",
          },
          validateStatus: (status) => {
            console.log(status, status === 404);
            return (status >= 200 && status < 300) || status === 404;
          },
        }
      );

      if (response.status === 404) {
        throw new Error("Graph is not a valid graph");
      }

      const responseData = ColoringAssigmentResponseSchema.safeParse(
        response.data as ColoringAssigmentResponse
      );

      console.log(responseData);

      if (!responseData.success) {
        throw responseData.error;
      }

      return responseData.data;
    },
  });

  const sendColoringRequest: MouseEventHandler<HTMLButtonElement> = (e) => {
    console.log("Sending coloring request");
    refetch();
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild></Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Dialog.Title className="DialogTitle">
            Find a proper ({k},{r})-coloring
          </Dialog.Title>
          <Dialog.Description className="DialogDescription">
            Define the parameters for the coloring assignment:
          </Dialog.Description>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="k-input">
              K
            </label>
            <input
              id="k-input"
              placeholder="Number of colors"
              type="number"
              className="Input"
              defaultValue={4}
              min={3}
              onChange={(e) => setK(Number(e.target.value))}
              disabled={isLoading}
            />
          </fieldset>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="r-input">
              R
            </label>
            <input
              id="r-input"
              placeholder="Dynamic parameter"
              type="number"
              className="Input" 
              defaultValue={1}
              min={1}
              onChange={(e) => setR(Number(e.target.value))}
              disabled={isLoading}
            />
          </fieldset>
          <button
            className="Button blue"
            style={{ marginRight: "1rem" }}
            onClick={sendColoringRequest}
            disabled={isLoading}
          >
            Assign Coloring
          </button>
          <Dialog.Close asChild>
                <button className="IconButton" aria-label="Close">
                    <X/>
                </button>
            </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
