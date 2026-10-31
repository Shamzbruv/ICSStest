import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

function statusMeta(status) {
  switch (status) {
    case "pending":
    case "running":
    case "in_progress":
      return { icon: Loader2, spin: true, text: "Working…", cls: "text-muted-foreground" };
    case "success":
    case "completed":
      return { icon: CheckCircle2, text: "Done", cls: "text-emerald-500" };
    case "failed":
    case "error":
      return { icon: AlertCircle, text: "Failed", cls: "text-destructive" };
    default:
      return { icon: CheckCircle2, text: status || "Done", cls: "text-muted-foreground" };
  }
}

function FunctionDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const proj = toolCall.display_projection || {};
  const meta = statusMeta(toolCall.status);
  const Icon = meta.icon;
  const hide = proj.hide_details && proj.details_redacted;
  const running =
    toolCall.status === "pending" ||
    toolCall.status === "running" ||
    toolCall.status === "in_progress";
  const failedStatus =
    toolCall.status === "failed" || toolCall.status === "error";
  const label = running
    ? proj.active_label || meta.text
    : failedStatus
    ? proj.error_label || meta.text
    : proj.label || meta.text;

  let parsedArgs = toolCall.arguments_string;
  try {
    parsedArgs = JSON.parse(toolCall.arguments_string);
  } catch (e) {
    /* keep raw */
  }
  let parsedResults = toolCall.results;
  if (typeof parsedResults === "string") {
    try {
      parsedResults = JSON.parse(parsedResults);
    } catch (e) {
      /* keep raw */
    }
  }
  const failed =
    failedStatus ||
    parsedResults?.success === false ||
    /error|failed/i.test(
      typeof parsedResults === "string" ? parsedResults : JSON.stringify(parsedResults || "")
    );

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
      >
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <Icon
          className={`w-3.5 h-3.5 ${meta.spin ? "animate-spin" : ""} ${
            failed ? "text-destructive" : meta.cls
          }`}
        />
        <span>{label}</span>
      </button>
      {expanded && !hide && (
        <div className="mt-1.5 ml-5 space-y-1">
          {parsedArgs && (
            <pre className="bg-background/60 rounded p-2 overflow-x-auto">
              Params: {JSON.stringify(parsedArgs, null, 2)}
            </pre>
          )}
          {parsedResults != null && (
            <pre className="bg-background/60 rounded p-2 overflow-x-auto">
              Result: {JSON.stringify(parsedResults, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 ${
          isUser ? "bg-amber-500 text-black" : "bg-muted"
        }`}
      >
        {message.content &&
          (isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown className="text-sm prose prose-sm max-w-none">
              {message.content}
            </ReactMarkdown>
          ))}
        {message.tool_calls?.map((tc, i) => (
          <FunctionDisplay key={i} toolCall={tc} />
        ))}
      </div>
    </div>
  );
}