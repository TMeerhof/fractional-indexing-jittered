import{ IndexGenerator } from "fractional-indexing-jittered";
import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { uid } from "../utils/uid";
import { Card } from "../components/Card";
import { Name } from "../components/Name";
import { List } from "../components/List";
import { ButtonBar } from "../components/ButtonBar";

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

export const SimpleListWithoutJitter = () => {
  const [list, setList] = useState<MyObject[]>([]);
  const orderKeys = list.map((item) => item.order);
  // creating a new generator on every render is not a big deal for simple lists
  const generator = new IndexGenerator(orderKeys, { useJitter: false });

  const addToList = (orders: string[]) => {
    const items = orders.map((order) => ({ id: uid(), order }));
    const newList = sortListOnOrderKeyAndId([...list, ...items]);
    setList(newList);
  };

  const handlePrepend = () => {
    addToList([generator.keyStart()]);
  };

  const handleAppend = () => {
    addToList([generator.keyEnd()]);
  };

  const handleBefore = (orderKey: string) => {
    addToList([generator.keyBefore(orderKey)]);
  };

  const handleNBefore = (orderKey: string, n: number) => {
    addToList(generator.nKeysBefore(orderKey, n));
  };

  const handleAfter = (orderKey: string) => {
    addToList([generator.keyAfter(orderKey)]);
  };

  const handleNAfter = (orderKey: string, n: number) => {
    addToList(generator.nKeysAfter(orderKey, n));
  };

  // Fill the example with demo data
  useEffect(() => {
    addToList(generator.nKeysStart(3));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <List>
      <Button onClick={handlePrepend}>Prepend</Button>
      <Button onClick={handleAppend}>Append</Button>
      <ol>
        {list.map((item) => (
          <li key={item.id}>
            <Card>
              <Name>{item.order}</Name>
              <ButtonBar>
                <Button onClick={() => handleBefore(item.order)}>
                  1 Before
                </Button>
                <Button onClick={() => handleNBefore(item.order, 3)}>
                  3 Before
                </Button>
                <Button onClick={() => handleAfter(item.order)}>1 After</Button>
                <Button onClick={() => handleNAfter(item.order, 3)}>
                  3 After
                </Button>
              </ButtonBar>
            </Card>
          </li>
        ))}
      </ol>
    </List>
  );
};

