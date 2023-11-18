import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { SimpleList } from "./examples/simple";
import { MemoizeGenerator } from "./examples/memoizedGenerator";
import { Interleaving } from "./examples/interleaving";
import { SimpleListWithoutJitter } from "./examples/simpleListWithoutJitter";
import { InterleavingWithoutJitter } from "./examples/interleavingWithoutJitter";
import { GroupList } from "./examples/groups";

function App() {
  return (
    <div className="App">
      <nav>
        <Link to="/">Home</Link> Fractional indexing jittered examples
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="simple" element={<SimpleList />} />
        <Route
          path="simple-no-jitter"
          element={<SimpleListWithoutJitter />}
        />
        <Route path="memoize" element={<MemoizeGenerator />} />
        <Route path="interleaving" element={<Interleaving />} />
        <Route
          path="interleaving-no-jitter"
          element={<InterleavingWithoutJitter />}
        />
        <Route path="groups" element={<GroupList />} />
      </Routes>
    </div>
  );
}

const Home = () => (
  <>
    <h2>Home</h2>
    <Link to="/simple">Simple list with Jittering</Link>
    <br />
    <Link to="/simple-no-jitter">Simple list without Jittering</Link>
    <br />
    <Link to="/memoize">Memoized generator</Link>
    <br />
    <Link to="/interleaving">Interleaving example with jittering</Link>
    <br />
    <Link to="/interleaving-no-jitter">
      Interleaving example without jittering
    </Link>
    <br />
    <Link to="/groups">Grouped sorted list</Link>
    <br />
  </>
);

export default App;
