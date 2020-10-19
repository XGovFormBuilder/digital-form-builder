import Component from "./component";
export default class Para extends Component {
  getViewModel() {
    const model = {
      content: this.content,
    };

    if (this.options.condition) {
      model.condition = this.options.condition;
    }

    return model;
  }
}
