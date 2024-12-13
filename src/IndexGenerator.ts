import { IndexedCharacterSet, base62CharSet } from "./charSet";
import {
  generateNJitteredKeysBetween,
  generateNKeysBetween,
} from "./generateKeyBetween";

export interface GeneratorOptions {
  charSet?: IndexedCharacterSet;
  useJitter?: boolean;
  groupIdLength?: number;
}

export class IndexGenerator {
  private charSet: IndexedCharacterSet;
  private useJitter: boolean;
  private list: string[];
  private useGroups: boolean;
  private groupIdLength: number;

  constructor(list: string[], options: GeneratorOptions = {}) {
    this.charSet = options.charSet ?? base62CharSet();
    this.useJitter = options.useJitter ?? true;
    this.list = list;
    this.useGroups = !!options.groupIdLength && options.groupIdLength > 0;
    this.groupIdLength = options.groupIdLength ?? 0;
  }

  /**
   * Updates the list that the generator uses to generate keys.
   * The generator will not mutate the internal list when generating keys.
   */
  public updateList(list: string[]) {
    this.list = [...list].sort();
  }

  /**
   * Generate any number of keys at the start of the list (before the first key).
   * Optionally you can supply a groupId to generate keys at the start of a specific group.
   */
  public nKeysStart(n: number, groupId?: string): string[] {
    this.validateGroupId(groupId);
    return this.generateNKeysBetween(
      null,
      this.firstOfGroup(groupId),
      n,
      groupId
    );
  }

  /**
   * Generate a single key at the start of the list (before the first key).
   * Optionally you can supply a groupId to generate a key at the start of a specific group.
   */
  public keyStart(groupId?: string): string {
    this.validateGroupId(groupId);
    return this.nKeysStart(1, groupId)[0];
  }

  /**
   * Generate any number of keys at the end of the list (after the last key).
   * Optionally you can supply a groupId to generate keys at the end of a specific group.
   */
  public nKeysEnd(n: number, groupId?: string): string[] {
    this.validateGroupId(groupId);
    return this.generateNKeysBetween(
      this.lastOfGroup(groupId),
      null,
      n,
      groupId
    );
  }

  /**
   * Generate a single key at the end of the list (after the last key).
   * Optionally you can supply a groupId to generate a key at the end of a specific group.
   */
  public keyEnd(groupId?: string): string {
    this.validateGroupId(groupId);
    return this.nKeysEnd(1, groupId)[0];
  }

  /**
   * Generate any number of keys behind a specific key and in front of the next key.
   * GroupId will be inferred from the orderKey if working with groups
   */
  public nKeysAfter(orderKey: string, n: number): string[] {
    const keyAfter = this.getKeyAfter(orderKey);
    return this.generateNKeysBetween(
      orderKey,
      keyAfter,
      n,
      this.groupId(orderKey)
    );
  }

  /**
   * Generate a single key behind a specific key and in front of the next key.
   * GroupId will be inferred from the orderKey if working with groups
   */
  public keyAfter(orderKey: string): string {
    return this.nKeysAfter(orderKey, 1)[0];
  }

  /**
   * Generate any number of keys in front of a specific key and behind the previous key.
   * GroupId will be inferred from the orderKey if working with groups
   */
  public nKeysBefore(orderKey: string, n: number): string[] {
    const keyBefore = this.getKeyBefore(orderKey);
    return this.generateNKeysBetween(
      keyBefore,
      orderKey,
      n,
      this.groupId(orderKey)
    );
  }

  /**
   * Generate a single key in front of a specific key and behind the previous key.
   * GroupId will be inferred from the orderKey if working with groups
   */
  public keyBefore(orderKey: string): string {
    return this.nKeysBefore(orderKey, 1)[0];
  }

  /**
   * private function responsible for calling the correct generate function
   */
  private generateNKeysBetween(
    lowerKey: string | null,
    upperKey: string | null,
    n: number,
    groupId: string | undefined
  ): string[] {
    const lower = this.groupLessKey(lowerKey);
    const upper = this.groupLessKey(upperKey);
    const keys = this.useJitter
      ? generateNJitteredKeysBetween(lower, upper, n, this.charSet)
      : generateNKeysBetween(lower, upper, n, this.charSet);
    return !groupId ? keys : keys.map((key) => groupId + key);
  }

  /**
   * get the key before the supplied orderKey, if it exists and is in the same group
   */
  private getKeyBefore(orderKey: string): string | null {
    const index = this.list.indexOf(orderKey);
    if (index === -1) {
      throw new Error(`orderKey is not in the list`);
    }
    const before = this.list[index - 1];
    return !!before && this.isSameGroup(orderKey, before) ? before : null;
  }

  /**
   * get the key after the supplied orderKey, if it exists and is in the same group
   */
  private getKeyAfter(orderKey: string): string | null {
    const index = this.list.indexOf(orderKey);
    if (index === -1) {
      throw new Error(`orderKey is not in the list`);
    }
    const after = this.list[index + 1];
    return !!after && this.isSameGroup(orderKey, after) ? after : null;
  }

  /**
   * get the first key of the group (or the first key of the list if not using groups)
   */
  private firstOfGroup(groupId: string | undefined): string | null {
    if (!this.useGroups) return this.list[0] ?? null;
    const first = this.list.find((key) => this.isPartOfGroup(key, groupId));
    return first ?? null;
  }

  /**
   * get the last key of the group (or the last key of the list if not using groups)
   */
  private lastOfGroup(groupId: string | undefined): string | null {
    if (!this.useGroups) return this.list[this.list.length - 1] ?? null;
    const allGroupItems = this.list.filter((key) =>
      this.isPartOfGroup(key, groupId)
    );
    const last = allGroupItems[allGroupItems.length - 1];
    return last ?? null;
  }

  /**
   * throw an error if the groupId is invalid or supplied when not using groups
   */
  private validateGroupId(groupId: string | undefined) {
    if (!this.useGroups) {
      if (groupId) {
        console.warn("groupId should not used when not using groups");
      }
      return;
    }
    if (!groupId) {
      throw new Error("groupId is required when using groups");
    }
    if (groupId.length !== this.groupIdLength) {
      throw new Error(`groupId must be the lenght supplied in the options`);
    }
  }

  /**
   * get the groupId from the orderKey
   */
  private groupId(orderKey: string): string | undefined {
    if (!this.useGroups) return undefined;
    return this.splitIntoGroupIdAndOrderKey(orderKey)[0];
  }

  /**
   * remove the groupId from the orderKey
   */
  private groupLessKey(orderKey: string | null): string | null {
    if (!this.useGroups) return orderKey;
    return this.splitIntoGroupIdAndOrderKey(orderKey)[1];
  }

  /**
   * split the orderKey into groupId and key
   * if not using groups, orderKey will be the same as key
   */
  private splitIntoGroupIdAndOrderKey(
    orderKey: string | null
  ): [string | undefined, string | null] {
    if (!this.useGroups || !orderKey) {
      return [undefined, orderKey];
    }
    const groupId = orderKey.substring(0, this.groupIdLength);
    const key = orderKey.substring(this.groupIdLength);
    return [groupId, key];
  }

  /**
   * check if two keys are in the same group
   * if not using groups, keys will always be in the same group
   */
  private isSameGroup(a: string, b: string): boolean {
    if (!this.useGroups) return true;
    const [aGroupId] = this.splitIntoGroupIdAndOrderKey(a);
    const [bGroupId] = this.splitIntoGroupIdAndOrderKey(b);
    return aGroupId === bGroupId;
  }

  /**
   * check if the key is part of the group
   * if not using groups, key will always be part of the group
   */
  private isPartOfGroup(orderKey: string, groupId?: string): boolean {
    if (!this.useGroups) return true;
    const [keyGroupId] = this.splitIntoGroupIdAndOrderKey(orderKey);
    return keyGroupId === groupId;
  }
}
