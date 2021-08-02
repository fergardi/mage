export const deleteKingdom = async (KINGDOM: string, firestore: FirebaseFirestore.Firestore): Promise<void> => {
  const batch: FirebaseFirestore.WriteBatch = firestore.batch();
  const artifacts = await firestore.collection(`kingdoms/${KINGDOM}/artifacts`).listDocuments();
  artifacts.forEach(artifact => batch.delete(artifact));
  const contracts = await firestore.collection(`kingdoms/${KINGDOM}/contracts`).listDocuments();
  contracts.forEach(contract => batch.delete(contract));
  const buildings = await firestore.collection(`kingdoms/${KINGDOM}/buildings`).listDocuments();
  buildings.forEach(building => batch.delete(building));
  const troops = await firestore.collection(`kingdoms/${KINGDOM}/troops`).listDocuments();
  troops.forEach(troop => batch.delete(troop));
  const supplies = await firestore.collection(`kingdoms/${KINGDOM}/supplies`).listDocuments();
  supplies.forEach(supply => batch.delete(supply));
  const charms = await firestore.collection(`kingdoms/${KINGDOM}/charms`).listDocuments();
  charms.forEach(charm => batch.delete(charm));
  const letters = await firestore.collection(`kingdoms/${KINGDOM}/letters`).listDocuments();
  letters.forEach(letter => batch.delete(letter));
  batch.delete(firestore.doc(`kingdoms/${KINGDOM}`));
  await batch.commit();
};
