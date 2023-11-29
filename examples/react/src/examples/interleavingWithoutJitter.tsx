import { useEffect, useRef, useState } from "react";
import { List } from "../components/List";
import{ IndexGenerator } from "fractional-indexing-jittered";
import { Button } from "../components/Button";
import { ButtonBar } from "../components/ButtonBar";
import { Card } from "../components/Card";
import { Name } from "../components/Name";
import { uid } from "../utils/uid";
import { SmallText } from "../components/SmallText";
import { Page } from "../components/Page";
import { Introduction } from "../components/Introduction";

type MyObject = {
  id: string;
  order: string;
  user: string;
};

function sortListOnOrderKeyAndId(list: MyObject[]) {
  return list.sort((a, b) => {
    if (a.order < b.order) return -1;
    if (a.order > b.order) return 1;
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });
}

const LATENCY = 3000;

const initial = [{ id: uid(), user: "Initial", order: "a0" }];

export const InterleavingWithoutJitter = () => {
  const [left, setLeft] = useState<MyObject[]>(initial);
  const [right, setRight] = useState<MyObject[]>(initial);
  const [syncing, setSyncing] = useState(false);

  const orderKeysLeft = left.map((item) => item.order);
  const leftGenerator = new IndexGenerator(orderKeysLeft, { useJitter: false });
  const orderKeysRight = right.map((item) => item.order);
  const rightGenerator = new IndexGenerator(orderKeysRight, { useJitter: false });
  const activeTimeouts = useRef(0);

  const addToLeft = (newObjects: MyObject[]) => {
    addToSourceAndRemoteWithLatency(newObjects, setLeft, setRight);
  };

  const addToRight = (newObjects: MyObject[]) => {
    addToSourceAndRemoteWithLatency(newObjects, setRight, setLeft);
  };

  const addToSourceAndRemoteWithLatency = (
    newObjects: MyObject[],
    source: React.Dispatch<React.SetStateAction<MyObject[]>>,
    remote: React.Dispatch<React.SetStateAction<MyObject[]>>
  ) => {
    source((prev) => sortListOnOrderKeyAndId([...prev, ...newObjects]));
    activeTimeouts.current += 1;
    setSyncing(true);
    setTimeout(() => {
      remote((prev) => sortListOnOrderKeyAndId([...prev, ...newObjects]));
      activeTimeouts.current -= 1;
      if (activeTimeouts.current === 0) {
        setSyncing(false);
      }
    }, LATENCY);
  };

  useEffect(() => {}, []);

  return (
    <>
      <Introduction>
        Below is an example of two lists that sync with 3 second latency. You
        can see interleaving in action by clicking the buttons in both lists
        within 3 seconds of each other. <br />
        In this example, we are not using jitter, so the keys will clash on interleave.
      </Introduction>
      <Page>
        <InterleavingList
          user="User 1"
          generator={leftGenerator}
          list={left}
          addObjects={addToLeft}
        ></InterleavingList>
        <SyncIndicator syncing={syncing}></SyncIndicator>
        <InterleavingList
          user="User 2"
          generator={rightGenerator}
          list={right}
          addObjects={addToRight}
        ></InterleavingList>
      </Page>
    </>
  );
};

interface InterleavingListProps {
  user: string;
  generator: IndexGenerator;
  list: MyObject[];
  addObjects: (list: MyObject[]) => void;
}

const InterleavingList: React.FC<InterleavingListProps> = ({
  generator,
  list,
  addObjects,
  user,
}) => {
  const handleNBefore = (orderKey: string, n: number) => {
    addObjects(
      generator
        .nKeysBefore(orderKey, n)
        .map((order) => ({ id: uid(), user, order }))
    );
  };
  const handleNAfter = (orderKey: string, n: number) => {
    addObjects(
      generator
        .nKeysAfter(orderKey, n)
        .map((order) => ({ id: uid(), user, order }))
    );
  };

  return (
    <List>
      <h2>{user}</h2>
      <ol>
        {list.map((item) => {
          const backGroundColor =
            item.user === "User 1"
              ? "#CEFBC1"
              : item.user === "User 2"
              ? "#E9CBFE"
              : undefined;

          return (
            <li key={item.id}>
              <Card color={backGroundColor}>
                <Name>
                  {item.order} <SmallText>{item.user}</SmallText>
                </Name>
                <ButtonBar>
                  <Button onClick={() => handleNBefore(item.order, 1)}>
                    1 Before
                  </Button>
                  <Button onClick={() => handleNBefore(item.order, 3)}>
                    3 Before
                  </Button>
                  <Button onClick={() => handleNAfter(item.order, 1)}>
                    After
                  </Button>
                  <Button onClick={() => handleNAfter(item.order, 3)}>
                    3 After
                  </Button>
                </ButtonBar>
              </Card>
            </li>
          );
        })}
      </ol>
    </List>
  );
};

interface SyncInditcatorProps {
  syncing: boolean;
}

const SyncIndicator: React.FC<SyncInditcatorProps> = ({ syncing }) => {
  return (
    <div className="syncing-indicator">{syncing ? "Syncing..." : "Synced"}</div>
  );
};
