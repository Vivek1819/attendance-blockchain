import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function App() {
  const [roll, setRoll] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [msg, setMsg] = useState("");

  const registerStudent = async () => {
    try {
      const { data } = await axios.post(`${API}/register`, { roll, name });
      setMsg(`Registered! Tx: ${data.txHash}`);
    } catch (e) {
      setMsg(e.response?.data?.error || e.message);
    }
  };

  const markPresent = async () => {
    try {
      const { data } = await axios.post(`${API}/mark`, { roll, date });
      setMsg(`Marked present! Tx: ${data.txHash}`);
    } catch (e) {
      setMsg(e.response?.data?.error || e.message);
    }
  };

  const fetchStudent = async () => {
    try {
      const { data } = await axios.get(`${API}/student/${roll}`);
      setMsg(JSON.stringify(data));
    } catch (e) {
      setMsg(e.response?.data?.error || e.message);
    }
  };

  const checkPresent = async () => {
    try {
      const { data } = await axios.get(`${API}/present/${roll}/${date}`);
      setMsg(JSON.stringify(data));
    } catch (e) {
      setMsg(e.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Attendance DApp (Local Hardhat)</h2>

      <div>
        <input placeholder="Roll" value={roll} onChange={e=>setRoll(e.target.value)} />
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={registerStudent}>Register</button>
      </div>

      <div style={{ marginTop: 10 }}>
        <input value={date} onChange={e=>setDate(e.target.value)} />
        <button onClick={markPresent}>Mark Present</button>
      </div>

      <div style={{ marginTop: 10 }}>
        <button onClick={fetchStudent}>Get Student</button>
        <button onClick={checkPresent}>Is Present?</button>
      </div>

      <pre style={{ marginTop: 20, background: "#f4f4f4", padding: 10 }}>{msg}</pre>
    </div>
  );
}
