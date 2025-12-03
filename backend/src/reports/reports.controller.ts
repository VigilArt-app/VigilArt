import { Controller } from "@nestjs/common";

@Controller("reports")
export class ReportsController {
  //make a route /reports/artwork/:id
  // that return IVisualSearchResult
  // with sample for MatchingPages
  // and another /reports/artwork/:id/matches
  // that return all matchingpages with pagination (limit, offset, matchType: default all, partial or full)
}
