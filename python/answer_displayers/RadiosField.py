from python.answer_displayers.shared.answer_displayer import AnswerDisplayer


class RadiosFieldDisplayer(AnswerDisplayer):
    def __init__(self, answer: str):
        self.raw_answer = answer

    @property
    def _answer_without_hyphens_capitalised(self):
        answer = self.raw_answer.replace("-", " ")
        if answer.isupper():
            return answer
        return answer.capitalize()

    @property
    def as_csv(self):
        return self._answer_without_hyphens_capitalised

    @property
    def as_txt(self):
        return self._answer_without_hyphens_capitalised

    @property
    def as_pdf(self):
        return self._answer_without_hyphens_capitalised
