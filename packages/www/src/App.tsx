import "./App.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "./lib/trpc";

function App() {
  const { data } = useQuery(trpc.ping.queryOptions());
  const { mutate } = useMutation(
    trpc.mutate.mutationOptions({
      onSuccess: () => {
        alert("Mutation succeeded");
      },
      onError: (error) => {
        alert(`Mutation failed: ${error.message}`);
      },
    }),
  );

  return (
    <div>
      <div className="card">
        <button onClick={() => mutate()}>invoke mutation</button>
      </div>
      <p>Query response: {data}</p>
    </div>
  );
}

export default App;
