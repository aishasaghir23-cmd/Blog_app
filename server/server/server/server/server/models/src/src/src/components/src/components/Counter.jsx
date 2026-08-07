import { useEffect } from "react";

const Counter = ({ count, onIncrease }) => {
  useEffect(() => {
    console.log("Counter changed to:", count);
  }, [count]);

  return (
    <div className="counter-box">
      <h3>Counter (props + useEffect demo)</h3>
      <p className="counter-value">{count}</p>
      <button onClick={onIncrease}>Add 1</button>
      <p className="counter-hint">Open the browser console to see the effect firing.</p>
    </div>
  );
};

export default Counter;
