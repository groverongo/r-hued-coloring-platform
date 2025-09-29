import { LinksType } from "@/common/types"
import Link from "../classes/link"
import NodeC from "../classes/node"
import SelfLink from "../classes/self_link"

export type ObjectType = {
    nodes: NodeC[],
    links: Link[]
}

export default function ExportAsJson(nodes: NodeC[], links: LinksType[]) {

    const obj: ObjectType = {"nodes": [], "links": []}

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if(node === undefined) continue
        obj.nodes.push({
            ...node.json_model,
            name: node.text,
            outputs: node.outputs,
            isAcceptState: node.isAcceptState,
            node_id: node.nodeId,

            draw_prop: JSON.stringify(
                {
                    x: node.x,
                    y: node.y,
                    radius: node.radius,
                    fontSize: node.fontSize,
                }
            )
        })
    }


    for (let i = 0; i < links.length; i++) {
        const link = links[i]
        if(link === undefined) continue
        if (link instanceof SelfLink) {
            obj.links.push({
                    ...link.json_model,
                    name: link.text,
                    source: link.node.text,
                    source_id: link.node.nodeId,
                    link_id: link.linkId,


                    draw_prop: JSON.stringify(
                        {
                            type: "SelfLink",
                            mouseOffsetAngle: link.mouseOffsetAngle,
                            anchorAngle: link.anchorAngle,
                            fontSize: link.fontSize
                        }
                    )


                }
            )
        } else if (link instanceof Link) {
            obj.links.push({
                ...link.json_model,
                name: link.text,
                source: link.nodeA.text,
                dest: link.nodeB.text,
                source_id: link.nodeA.nodeId,
                dest_id: link.nodeB.nodeId,
                link_id: link.linkId,

                draw_prop: JSON.stringify({
                    type: "Link",
                    lineAngleAdjust: link.lineAngleAdjust,
                    parallelPart: link.parallelPart,
                    perpendicularPart: link.perpendicularPart,
                    fontSize: link.fontSize
                })
            })
        }
    }

    return JSON.stringify(obj)
}


