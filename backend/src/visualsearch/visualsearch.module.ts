import { Module } from "@nestjs/common";
import { VisualSearchService } from "./visual-search.service";
import { GoogleLensModule } from "../googlelens/googlelens.module";
import { SerpApiLensModule } from "../serpapilens/serpapilens.module";

@Module({
  imports: [GoogleLensModule, SerpApiLensModule],
  providers: [VisualSearchService],
  exports: [VisualSearchService]
})
export class VisualSearchModule {}
