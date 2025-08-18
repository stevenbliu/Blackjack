import { useAppSelector, useAppDispatch } from '@/app/hooks';
// import { purchaseItem } from '@/features/store/storeSlice';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  const storeItems = fakeStoreItems;
  const playerCurrency = 425;
  const ownedItems = ['potion001', 'hat001'];

  const handlePurchase = (itemId: string) => {
    // dispatch(purchaseItem(itemId));
    console.log('Purchased:', itemId);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 bg-background text-foreground min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Item Shop</h1>
        <div className="flex items-center gap-2 text-lg font-medium">
          <span className="text-accent">{playerCurrency}</span>
          <span role="img" aria-label="coin">🪙</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {storeItems.map(item => {
          const owned = ownedItems.includes(item.id);
          const canAfford = playerCurrency >= item.price;

          return (
            <Card key={item.id} className="bg-card text-card-foreground relative shadow-md">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg font-semibold">
                  {item.name}
                  {owned && <Badge variant="secondary">Owned</Badge>}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>

              <CardFooter className="flex justify-between items-center mt-2">
                <span className="font-semibold text-accent">{item.price} 🪙</span>
                <Button
                  variant="default"
                  onClick={() => handlePurchase(item.id)}
                  disabled={owned || !canAfford}
                >
                  {owned ? 'Owned' : 'Buy'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
