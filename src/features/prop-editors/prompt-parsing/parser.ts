function* realTokenizer(s: string) {
    let current = 0
    for (let i = 0; i < s.length; i++) {
        const c = s[i]
        if (c === '{' || c === '}' || c === '[' || c === ']' || c === '(' || c === ')' || c == '|' || c == ':' || c == '@') {
            if (current !== i) {
                yield s.substring(current, i)
            }
            yield c
            current = i + 1
        }
    }
    let s1 = s.substring(current);
    if (s1.length > 0)
        yield s1
}

function tokenizer(s: string): Tokens {
    let internalTokens = realTokenizer(s);
    let tokens: Tokens = {
        next() {
            let next = internalTokens.next();
            if (!next.done) {
                tokens.current = next.value!!;
            }
            return !next.done
        },
    };
    return tokens
}

type Tokens = {
    next(): boolean
    current?: string
}
export type WeightAlt = {
    nodes: Node[]
    weight: Node[]
}
export type WeightedNode = { type: 'weighted', alts: WeightAlt[] };
export type ScheduleNode = { type: 'schedule', from: Node[], to: Node[], step: Node[] };
export type AttentionAddNode = { type: 'attention_add', weight: Node[], nodes: Node[] };
export type AttentionRemoveNode = { type: 'attention_remove', nodes: Node[] };
export type Node = string |
    WeightedNode |
    ScheduleNode |
    AttentionAddNode |
    AttentionRemoveNode

function parseSquare(tokens: Tokens): AttentionRemoveNode | ScheduleNode {
    // const node: ScheduleNode = {type: "schedule", start: [], end:[], step: 0}
    let sections: { first: Node[], second: Node[], third: Node[] } = {first: [], second: [], third: []}
    let nodes = sections.first
    while (tokens.next()) {
        const token = tokens.current!!
        const parsedNode = maybeParseNode(tokens)
        if (parsedNode) {
            nodes.push(parsedNode)
        } else if (token === ']') {
            break
        } else if (token === ':') {
            if (nodes === sections.first) {
                nodes = sections.second
            } else if (nodes === sections.second) {
                nodes = sections.third
            } else {
                sections.second = [...sections.second, ':', ...nodes]
                nodes = sections.third = []
            }
        } else
            nodes.push(token)
    }

    if (sections.second.length === 0 && sections.third.length === 0) {
        return {type: 'attention_remove', nodes: sections.first}
    }
    if (sections.third.length === 0) {
        return {type: 'schedule', from: [], to: sections.first, step: sections.second}
    }

    return {type: 'schedule', from: sections.first, to: sections.second, step: sections.third}
}

function parseCurly(tokens: Tokens): WeightedNode {
    const alts: WeightAlt[] = []
    let nodes: Node[] = []
    let nextAlt: WeightAlt = {nodes, weight: []}

    while (tokens.next()) {
        const token = tokens.current!!
        const parsedNode = maybeParseNode(tokens)
        if (parsedNode) {
            nodes.push(parsedNode)
        } else if (token === '}') {
            break
        } else if (token === '|') {
            alts.push(nextAlt)
            nodes = []
            nextAlt = {nodes, weight: []}
        } else if (token === ':') {
            if (nodes === nextAlt.weight) {
                nextAlt.nodes = [...nextAlt.nodes, ':', ...nextAlt.weight]
                nextAlt.weight = []
            }

            nodes = nextAlt.weight
        } else
            nodes.push(token)
    }
    alts.push(nextAlt)
    return {type: 'weighted', alts}
}

function parseParen(tokens: Tokens) {
    const node: AttentionAddNode = {type: "attention_add", nodes: [], weight: []}
    let nodes = node.nodes
    while (tokens.next()) {
        const token = tokens.current!!
        const parsedNode = maybeParseNode(tokens)
        if (parsedNode) {
            nodes.push(parsedNode)
        } else if (token === ')') {
            break
        } else if (token === ':') {
            if (nodes === node.weight) {
                node.nodes = [...node.nodes, ':', ...node.weight]
                node.weight = []
            }
            nodes = node.weight
        } else
            nodes.push(token)
    }

    return node
}

function maybeParseNode(tokens: Tokens): Node | undefined {
    let token = tokens.current;
    if (token == '{')
        return parseCurly(tokens)
    else if (token == '[')
        return parseSquare(tokens)
    else if (token == '(')
        return parseParen(tokens)
}

export function parseInternal(tokens: Tokens): Node[] {
    const result: Node[] = []

    while (tokens.next()) {
        const parsedNode = maybeParseNode(tokens)
        if (parsedNode)
            result.push(parsedNode)
        else
            result.push(tokens.current!!)
    }
    if(result.length===0)
        return [""]
    return result
}

export function parse(s: string): Node[] {
    return parseInternal(tokenizer(s))
}

