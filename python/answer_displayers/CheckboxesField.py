from python.answer_displayers.shared.answer_displayer import AnswerDisplayer


class CheckboxesFieldDisplayer(AnswerDisplayer):
    def __init__(self, answer: list[str]):
        self.raw_answer: list[str] = answer

    @property
    def _answer_without_hyphens_capitalised(self):
        return [a.replace("-", " ").capitalize() for a in self.raw_answer]

    @property
    def as_csv(self) -> str:
        answers = self._answer_without_hyphens_capitalised
        return "\n".join(answers)

    @property
    def as_txt(self) -> str:
        answers = self._answer_without_hyphens_capitalised
        return "\n".join(answers)

    @property
    def as_pdf(self) -> str:
        answers = self._answer_without_hyphens_capitalised
        return "\n".join(answers)
