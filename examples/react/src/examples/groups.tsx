import{ IndexGenerator } from "fractional-indexing-jittered";
import { useState } from "react";
import { Button } from "../components/Button";
import { uid } from "../utils/uid";
import { Card } from "../components/Card";
import { Name } from "../components/Name";
import { List } from "../components/List";
import { ButtonBar } from "../components/ButtonBar";
import { SmallText } from "../components/SmallText";
import { Introduction } from "../components/Introduction";

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

type GroupKey = 'g1' | 'g2' | 'g3' | 'g4';

const groups: Record<GroupKey,string> = {
  'g1': 'Group 1',
  'g2': 'Group 2',
  'g3': 'Group 3',
  'g4': 'Group 4',
}

const groupColors : Record<GroupKey,string> = {
  'g1': '#facecb',
  'g2': '#badffe',
  'g3': '#a7cba8',
  'g4': '#f8f2b8',
}

export const GroupList = () => {
  const [list, setList] = useState<MyObject[]>(initialItems);
  const orderKeys = list.map((item) => item.order);
  // creating a new generator on every render is not a big deal for simple lists
  const generator = new IndexGenerator(orderKeys, { groupIdLength: 2, useJitter: false });

  const addToList = (orders: string[]) => {
    const items = orders.map((order) => ({ id: uid(), order }));
    const newList = sortListOnOrderKeyAndId([...list, ...items]);
    setList(newList);
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

  return (
    <>
     <Introduction>
        Groups can be used to create a sortable grouping of items, 
        without the posibility of items from different groups being interleaved.
      </Introduction>
    <List>
      <ol>
        {list.map((item) => {
          const groupId = item.order.slice(0, 2) as GroupKey;
          
          return (
          <li key={item.id}>
            <Card color={groupColors[groupId]}>
              <Name>{item.order} <SmallText>{groups[groupId]}</SmallText></Name>
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
        )})}
      </ol>
    </List>
    </>
  );
};

const initialItems = Object.keys(groups).map((groupId) => ({
  id: uid(),
  order: groupId + 'a0',
}));