import LinkC from "@/classes/link";
import NodeC from "@/classes/node";
import SelfLink from "@/classes/self_link";
import StartLink from "@/classes/start_link";
import { TemporaryLink } from "@/classes/temporary_link";

export type CurrentLinkType = LinkC | StartLink | SelfLink | TemporaryLink | null;
export type SelectedObjectType = LinkC | StartLink | SelfLink | TemporaryLink | NodeC | null;
export type LinksType = LinkC | StartLink | SelfLink | TemporaryLink;