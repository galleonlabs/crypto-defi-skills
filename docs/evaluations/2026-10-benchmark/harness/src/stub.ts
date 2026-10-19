import type Anthropic from "@anthropic-ai/sdk";
import type { CallModel } from "./agent.ts";

/**
 * Offline stand-in for the Messages API used by `dry-run`. It exercises the
 * tool loop (read SKILL.md, list the directory, try a path outside the skill),
 * the grader's JSON contract and the ledger without any network call.
 */
export function stubModel(): CallModel {
  let counter = 0;
  const usage = (input: string, output: string): Anthropic.Usage => ({
    input_tokens: Math.ceil(input.length / 4),
    output_tokens: Math.ceil(output.length / 4) + 400,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 0 },
    inference_geo: "global",
    server_tool_use: null,
    service_tier: "standard",
    output_tokens_details: { thinking_tokens: 400 },
  });
  const message = (content: Anthropic.ContentBlock[], stop: Anthropic.StopReason, input: string, output: string): Anthropic.Message =>
    ({
      id: `stub_${++counter}`,
      type: "message",
      role: "assistant",
      model: "claude-opus-5-5",
      content,
      stop_reason: stop,
      stop_sequence: null,
      stop_details: null,
      container: null,
      usage: usage(input, output),
    }) as Anthropic.Message;
  return async (params) => {
    const input = JSON.stringify(params);
    const thinking = { type: "thinking", thinking: "stub reasoning summary", signature: "stub" } as Anthropic.ThinkingBlock;
    if (params.system) {
      const turn = String(params.messages[0]!.content);
      const ids = [...turn.matchAll(/^([EF]\d+): /gm)].map((match) => match[1]!);
      const answer = turn.split("<answer>\n")[1]?.split("\n</answer>")[0] ?? "";
      const criteria = ids.map((id) => ({
        id,
        verdict: id.startsWith("E") ? "yes" : "no",
        evidence: id === "E1" ? answer.slice(0, 40) : "",
        note: "stub verdict",
      }));
      const text = JSON.stringify({ criteria });
      return message([thinking, { type: "text", text, citations: null } as Anthropic.TextBlock], "end_turn", input, text);
    }
    const toolResults = params.messages.filter((entry) => entry.role === "user" && Array.isArray(entry.content)).length;
    if (params.tools && toolResults < 3 && params.tool_choice?.type !== "none") {
      const path = ["SKILL.md", ".", "../../evals/behavior.json"][toolResults]!;
      const use = { type: "tool_use", id: `toolu_stub_${counter}`, name: "read_skill_file", input: { path }, caller: null } as unknown as Anthropic.ToolUseBlock;
      return message([thinking, use], "tool_use", input, path);
    }
    const text = `Stub answer for the dry run. Figures for the number check: 1.219, 87.5, 34.75, 3.25.`;
    return message([thinking, { type: "text", text, citations: null } as Anthropic.TextBlock], "end_turn", input, text);
  };
}
