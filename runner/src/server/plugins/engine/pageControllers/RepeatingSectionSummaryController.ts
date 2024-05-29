import { FormModel } from "server/plugins/engine/models";
import { Section } from "server/plugins/engine/models/Section";

export class RepeatingSectionSummaryController {
  model: FormModel;
  section: Section;
  path: string;
  constructor(formModel: FormModel, pageDef, section: Section) {
    this.model = formModel;
    this.section = section;
    this.path = `${pageDef.path}/summary`;
  }

  async getRouteHandler(request, h) {
    const { cacheService } = request.services([]);

    const state = await cacheService.getState(request);
    const { progress = [] } = state;
    progress?.push(`/${this.model.basePath}${this.path}/summary`);
    await cacheService.mergeState(request, { progress });

    const viewModel = this.getViewModel(state);

    return h.view("repeating-section-summary", viewModel);
  }

  getViewModel(state) {
    console.log(state);
    return {};
  }
}
