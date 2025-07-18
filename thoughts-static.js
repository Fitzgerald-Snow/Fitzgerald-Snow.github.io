// 静态思想数据 - 作为Firebase的备用方案
// 这个文件应该定期从Firebase同步更新

const staticThoughts = [
    {
        id: "static-001",
        title: "Below are all AI generated.",
        content: "In the intersection of mathematics and art, we find algorithms that can compose music, generate poetry, and create visual masterpieces. Yet the question remains: is this true creativity, or merely sophisticated pattern matching? I believe creativity is not about the origin of ideas, but about their impact and meaning.",
        timestamp: new Date("2024-12-20"),
        upvotes: 12,
        upvotedBy: [],
        isStatic: true
    },
    {
        id: "static-002", 
        title: "The Philosophy of Code",
        content: "Writing code is like crafting poetry in a language that machines understand. Every function, every variable name, every comment is a choice that reflects the programmer's thought process. Clean code is not just about efficiency—it's about expressing human intention in digital form.",
        timestamp: new Date("2024-12-15"),
        upvotes: 8,
        upvotedBy: [],
        isStatic: true
    },
    {
        id: "static-003",
        title: "Reflections on Time and Memory",
        content: "Memory is not a recording device but a creative reconstructor. Each time we recall a moment, we subtly alter it, like a painter touching up a canvas. Our past is not fixed—it evolves with our present understanding.",
        timestamp: new Date("2024-12-10"),
        upvotes: 15,
        upvotedBy: [],
        isStatic: true
    },
    {
        id: "static-004",
        title: "The Beauty of Mathematical Proofs",
        content: "A mathematical proof is like a perfect logical symphony. Each step follows naturally from the last, building toward an inevitable and beautiful conclusion. There's something deeply satisfying about the certainty that mathematics provides in an uncertain world.",
        timestamp: new Date("2024-12-05"),
        upvotes: 6,
        upvotedBy: [],
        isStatic: true
    },
    {
        id: "static-005",
        title: "Digital Minimalism in Practice",
        content: "In a world of infinite distractions, the ability to focus becomes a superpower. I've been experimenting with digital minimalism—not avoiding technology, but using it intentionally. The goal is not to use less technology, but to use technology that serves our highest purposes.",
        timestamp: new Date("2024-11-28"),
        upvotes: 9,
        upvotedBy: [],
        isStatic: true
    }
];

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = staticThoughts;
}
