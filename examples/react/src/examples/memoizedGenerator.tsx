import{ IndexGenerator } from "fractional-indexing-jittered";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { Button } from "../components/Button";
import { SmallText } from "../components/SmallText";
import { uid } from "../utils/uid";
import { ButtonBar } from "../components/ButtonBar";
import { Card } from "../components/Card";
import { Name } from "../components/Name";

type MyObject = {
  id: string;
  order: string;
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

export const MemoizeGenerator = () => {
  const [list, setList] = useState<MyObject[]>([]);

  // if you need to pass your callback functions to child component,
  // you can use `useCallback` to memoize the generator and the callback functions
  const generator = useMemo(() => {
    const initialOrder = list.map((item) => item.order);
    return new IndexGenerator(initialOrder);
    // we don't want to re-run this effect when the list changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToList = useCallback(
    (orders: string[]) => {
      const items = orders.map((order) => ({ id: uid(), order }));
      setList((previousList) => {
        const newList = sortListOnOrderKeyAndId([...previousList, ...items]);
        generator.updateList(newList.map((item) => item.order));
        return newList;
      });
    },
    [generator]
  );

  const handlePrepend = useCallback(() => {
    addToList([generator.keyStart()]);
  }, [addToList, generator]);

  const handleAppend = useCallback(() => {
    addToList([generator.keyEnd()]);
  }, [addToList, generator]);

  const handleNBefore = useCallback(
    (orderKey: string, n: number) => {
      addToList(generator.nKeysBefore(orderKey, n));
    },
    [addToList, generator]
  );

  const handleNAfter = useCallback(
    (orderKey: string, n: number) => {
      addToList(generator.nKeysAfter(orderKey, n));
    },
    [addToList, generator]
  );

  return (
    <div>
      <Button onClick={handlePrepend}>Prepend</Button>
      <Button onClick={handleAppend}>Append</Button>
      <ol>
        {list.map((item) => (
          <WrappedCard
            key={item.id}
            item={item}
            handleNBefore={handleNBefore}
            handleNAfter={handleNAfter}
          />
        ))}
      </ol>
    </div>
  );
};

interface MomoizedCardProps {
  item: MyObject;
  handleNBefore: (orderKey: string, n: number) => void;
  handleNAfter: (orderKey: string, n: number) => void;
}

// we can use `memo` to memoize the rendering of the child component
const WrappedCard = memo(
  ({ item, handleNBefore, handleNAfter }: MomoizedCardProps) => {
    const renderCount = useRef(0);
    renderCount.current += 1;

    return (
      <li key={item.id}>
        <Card>
          <Name>
            {item.order} {' '}
            <SmallText>times rendered: {renderCount.current}</SmallText>{" "}
          </Name>
          <ButtonBar>
            <Button onClick={() => handleNBefore(item.order, 1)}>
              1 Before
            </Button>
            <Button onClick={() => handleNBefore(item.order, 3)}>
              3 Before
            </Button>
            <Button onClick={() => handleNAfter(item.order, 1)}>After</Button>
            <Button onClick={() => handleNAfter(item.order, 3)}>
              3 After
            </Button>
          </ButtonBar>
        </Card>
      </li>
    );
  }
);
