import { useState } from "react";

type AddQuestionScreenProps = {
  onAddQuestion: (question: string) => void;
  onBack: () => void;
  questionsCount: number;
};

export default function AddQuestionScreen({
  onAddQuestion,
  onBack,
  questionsCount,
}: AddQuestionScreenProps) {
  const [newQuestion, setNewQuestion] = useState("");

  const handleAdd = () => {
    onAddQuestion(newQuestion);
    setNewQuestion("");
  };

  return (
    <div>
      <h2>Add Question</h2>
      <p>Questions: {questionsCount}</p>
      <label>
        Your question:
        <input
          type="text"
          value={newQuestion}
          onChange={(event) => setNewQuestion(event.target.value)}
          placeholder="z.B. Ist ein Werkzeug"
        />
      </label>
      <button onClick={handleAdd}>Add</button>
      <button onClick={onBack}>Back</button>
    </div>
  );
}
