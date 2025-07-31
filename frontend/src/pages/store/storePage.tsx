import { useAppSelector, useAppDispatch } from '../../app/hooks';
// import { purchaseItem } from '../features/store/storeSlice';
import styles from '../Pages.module.css';
import sstyles from './storePage.module.css'

const fakeStoreItems = [
  {
    id: 'hat001',
    name: 'Wizard Hat',
    price: 150,
    description: 'A magical hat that increases your charisma.',
  },
  {
    id: 'sword001',
    name: 'Iron Sword',
    price: 300,
    description: 'A basic but reliable weapon.',
  },
  {
    id: 'potion001',
    name: 'Health Potion',
    price: 50,
    description: 'Restores 50 HP. One-time use.',
  },
  {
    id: 'cloak001',
    name: 'Shadow Cloak',
    price: 500,
    description: 'Makes you harder to detect.',
  },
  {
    id: 'badge001',
    name: 'Founder’s Badge',
    price: 1000,
    description: 'A rare badge for early adopters.',
  },
];


export default function StorePage() {
  const dispatch = useAppDispatch();
//   const storeItems = useAppSelector(state => state.store.items);
//   const playerCurrency = useAppSelector(state => state.player.currency);
//   const ownedItems = useAppSelector(state => state.player.inventory);

    const storeItems = fakeStoreItems;
    const playerCurrency = 425;
    const ownedItems = ['potion001', 'hat001'];

  const handlePurchase = (itemId: string) => {
    // dispatch(purchaseItem(itemId));
    return console.log('handlePurchase');
  };

  return (
    <div className={`${styles.pageContainer} ${sstyles.storePage} ${sstyles.pageTransition}`}>
      <div className={sstyles.storeHeader}>
        <h1 className={sstyles.sectionTitle}>Item Shop</h1>
        <div className={sstyles.currencyDisplay}>
          <span className={sstyles.currencyAmount}>{playerCurrency}</span>
          <span className={sstyles.currencyIcon}>🪙</span>
        </div>
      </div>

      <div className={sstyles.storeGrid}>
        {storeItems.map(item => (
          <div key={item.id} className={sstyles.storeItem}>
            <div className={sstyles.itemImageContainer}>
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className={styles.itemImage}
              />
              {ownedItems.includes(item.id) && (
                <div className={sstyles.ownedBadge}>OWNED</div>
              )}
            </div>
            <h3 className={sstyles.itemName}>{item.name}</h3>
            <p className={sstyles.itemDescription}>{item.description}</p>
            <div className={sstyles.itemFooter}>
              <span className={sstyles.itemPrice}>{item.price} 🪙</span>
              <button
                onClick={() => handlePurchase(item.id)}
                disabled={ownedItems.includes(item.id) || playerCurrency < item.price}
                className={sstyles.purchaseButton}
              >
                {ownedItems.includes(item.id) ? 'Owned' : 'Buy'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}