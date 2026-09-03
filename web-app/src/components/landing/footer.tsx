import Image from "next/image";
import type { LandingStrings } from "../../app/landing/locale";

export function LandingFooter({ strings }: { strings: LandingStrings }) {
  return (
    <footer>
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-10 sm:px-6">
        <Image
          src="/VigilArt_wordmark_black.png"
          alt={strings.footer.wordmark_alt}
          width={600}
          height={164}
          className="h-7 w-auto dark:hidden"
        />
        <Image
          src="/VigilArt_wordmark_white.png"
          alt={strings.footer.wordmark_alt}
          width={600}
          height={164}
          className="hidden h-7 w-auto dark:block"
        />
      </div>
    </footer>
  );
}
