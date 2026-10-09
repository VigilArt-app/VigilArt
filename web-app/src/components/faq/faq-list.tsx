import { ChevronDown } from "lucide-react";
import type { FaqItem } from "./faq-content";

export function FaqList({
  items,
}: {
  items: readonly FaqItem[];
}): React.JSX.Element {
  return (
    <div className="mt-10 space-y-3">
      {items.map(({ question, answer }) => (
        <details
          key={question}
          className="group rounded-xl border bg-background open:shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
            <h2 className="mt-0! text-base font-semibold leading-6 tracking-normal sm:text-lg">
              {question}
            </h2>
            <ChevronDown
              aria-hidden="true"
              className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <div className="border-t px-5 pb-5 pt-1 [&_p]:mt-4 [&_p]:leading-7 [&_p]:text-muted-foreground">
            {answer}
          </div>
        </details>
      ))}
    </div>
  );
}
