import Link from "../elements/link"
import Node from "../elements/node"
import SelfLink from "../elements/self_link"
import StartLink from "../elements/start_link"
import type { ObjectType } from "../export_as/json"
import { nodes, links, nodeRadius, fontSize } from "./fsm"

function json_base_construct(obj: ObjectType) {


    if (obj) {
        nodes = []
        links = []

        try {
            for (let i = 0; i < obj.nodes.length; i++) {
                const storedNode = obj.nodes[i]
                if(storedNode === undefined) continue
                const drawProp = JSON.parse(storedNode.draw_prop)

                const node = new Node(drawProp.x, drawProp.y)
                node.isAcceptState = storedNode.isAcceptState
                node.text = storedNode.name
                node.outputs = storedNode.outputs
                node.nodeId = storedNode.node_id

                node.radius = drawProp.radius
                node.fontSize = drawProp.fontSize


                // extract all the other fields as json_model
                const json_model: any = {}
                for (const property in storedNode) {
                    if (storedNode.hasOwnProperty(property) && !node.hasOwnProperty(property) && property !== "draw_prop" && property !== "node_id") {
                        json_model[property] = storedNode[property]
                    }
                }

                node.json_model = json_model
                nodes.push(node)
            }


            for (let i = 0; i < obj.links.length; i++) {
                const storedLink = obj.links[i];
                const drawProp = JSON.parse(storedLink.draw_prop)
                let link = null;

                if (drawProp.type === 'SelfLink') {

                    let linkNode = null

                    for (let j = 0; j < nodes.length; j++) {
                        if (nodes[j].nodeId === storedLink.source_id) {
                            linkNode = nodes[j]
                            break
                        }
                    }


                    link = new SelfLink(linkNode);
                    link.anchorAngle = drawProp.anchorAngle;


                } else if (drawProp.type === 'Link') {


                    let linkNodeA = null
                    let linkNodeB = null

                    for (let j = 0; j < nodes.length; j++) {
                        if (nodes[j].nodeId === storedLink.source_id) {
                            linkNodeA = nodes[j]
                        }
                    }

                    for (let j = 0; j < nodes.length; j++) {
                        if (nodes[j].nodeId === storedLink.dest_id) {
                            linkNodeB = nodes[j]
                        }
                    }


                    link = new Link(linkNodeA, linkNodeB);
                    link.parallelPart = drawProp.parallelPart
                    link.perpendicularPart = drawProp.perpendicularPart
                    link.lineAngleAdjust = drawProp.lineAngleAdjust
                }

                if (link != null) {
                    link.fontSize = drawProp.fontSize
                    link.linkId = storedLink.link_id
                    link.text = storedLink.name;

                    // extract all the other fields as json_model
                    const json_model = {}
                    for (const property in storedLink) {
                        if (storedLink.hasOwnProperty(property) && !link.hasOwnProperty(property)
                            && property !== "draw_prop" && property !== "link_id"
                            && property !== "source" && property !== "source_id"
                            && property !== "dest" && property !== "dest_id"

                        ) {
                            json_model[property] = storedLink[property]
                        }
                    }
                    link.json_model = json_model
                    links.push(link);
                }

            }


        } catch (e) {
            console.log(e)
        }
    }


}


function restore(obj: ObjectType) {

    if (obj) {
        json_base_construct(obj)
        return;
    }


    if ((!localStorage || !JSON || !localStorage['fsm'])) {
        return;
    }


    obj = JSON.parse(localStorage['fsm']);
    {
        try {
            for (let i = 0; i < obj.nodes.length; i++) {
                const backupNode = obj.nodes[i];
                if(backupNode === undefined) continue
                const node = new Node(backupNode.x, backupNode.y);
                node.isAcceptState = backupNode.isAcceptState ?? false;
                node.text = backupNode.text ?? "";
                node.radius = backupNode.radius ?? nodeRadius;
                node.nodeId = backupNode.nodeId
                if (backupNode.json_model)
                    node.json_model = JSON.parse(backupNode.json_model)
                else
                    node.json_model = {}
                node.fontSize = backupNode.fontSize ?? fontSize;
                nodes.push(node);
            }

            for (let i = 0; i < obj.links.length; i++) {
                const backupLink = obj.links[i];
                if(backupLink === undefined) continue
                let link = null;

                if (backupLink.type === 'SelfLink') {
                    link = new SelfLink(nodes[backupLink.node]);
                    link.anchorAngle = backupLink.anchorAngle;
                    if (backupLink.json_model)
                        link.json_model = JSON.parse(backupLink.json_model)
                    else
                        backupLink.json_model = {}

                } else if (backupLink.type === 'StartLink') {
                    link = new StartLink(nodes[backupLink.node]);
                    link.deltaX = backupLink.deltaX ?? 0;
                    link.deltaY = backupLink.deltaY ?? 0;
                } else if (backupLink.type === 'Link') {
                    link = new Link(nodes[backupLink.nodeA], nodes[backupLink.nodeB]);
                    link.parallelPart = backupLink.parallelPart ?? 0.5;
                    link.perpendicularPart = backupLink.perpendicularPart ?? 0;
                    link.lineAngleAdjust = backupLink.lineAngleAdjust ?? 0;
                    if (backupLink.json_model)
                        link.json_model = JSON.parse(backupLink.json_model)
                    else
                        backupLink.json_model = {}

                }

                if (link != null) {
                    console.log(backupLink)
                    link.linkId = backupLink.linkId
                    link.text = backupLink.text ?? "";
                    link.fontSize = backupLink.fontSize
                    links.push(link);
                }

            }
        } catch (e) {
            localStorage['fsm'] = '';
        }
    }
}

function saveBackup() {
    if (!localStorage || !JSON) {
        return;
    }

    const backup: ObjectType = {
        'nodes': [],
        'links': [],
    };
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if(node === undefined) continue
        const backupNode = {
            'x': node.x,
            'y': node.y,
            'radius': node.radius,
            'text': node.text,
            'isAcceptState': node.isAcceptState,
            'json_model': JSON.stringify(node.json_model),
            'fontSize': node.fontSize,
            'nodeId': node.nodeId
        };
        backup.nodes.push(backupNode);
    }
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        let backupLink: Link | SelfLink | StartLink | null = null;
        if (link instanceof SelfLink) {
            backupLink = {
                'type': 'SelfLink',
                'node': nodes.indexOf(link.node),
                'text': link.text,
                'anchorAngle': link.anchorAngle,
                'json_model': JSON.stringify(link.json_model),
                'linkId': link.linkId,
                'fontSize': link.fontSize,
            };
        } else if (link instanceof StartLink) {
            backupLink = {
                'type': 'StartLink',
                'node': nodes.indexOf(link.node),
                'text': link.text,
                'deltaX': link.deltaX,
                'deltaY': link.deltaY,
                'linkId': link.linkId
            };
        } else if (link instanceof Link) {
            backupLink = {
                'type': 'Link',
                'nodeA': nodes.indexOf(link.nodeA),
                'nodeB': nodes.indexOf(link.nodeB),
                'json_model': JSON.stringify(link.json_model),
                'fontSize': link.fontSize,
                'text': link.text,
                'lineAngleAdjust': link.lineAngleAdjust,
                'parallelPart': link.parallelPart,
                'perpendicularPart': link.perpendicularPart,
                'linkId': link.linkId
            };
        }
        if (backupLink != null) {
            backup.links.push(backupLink);
        }
    }

    localStorage['fsm'] = JSON.stringify(backup);
}
