import ChoreList from './ChoreList.jsx';

export default function App() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#D1FAE5",
      backgroundImage: `
        radial-gradient(circle at 10% 15%, #F9A8D4 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, #FDE68A 0%, transparent 40%),
        radial-gradient(circle at 60% 40%, #86EFAC 0%, transparent 35%),
        radial-gradient(circle at 30% 70%, #93C5FD 0%, transparent 35%)
      `,
      paddingTop: "0px",
      fontFamily: "'Nunito', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <ChoreList />
    </main>
  );
}
