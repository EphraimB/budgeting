import generateWishlists from '../../generation/generateWishlists';
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set('2020-01-01');
});

afterAll(() => {
    MockDate.reset();
});

describe('generateWishlists', () => {
    test('should generate wishlist transaction', () => {
        const transactions = [
            { date: new Date('2023-07-01'), amount: 200, balance: 500 },
            { date: new Date('2023-08-01'), amount: 200, balance: 700 },
            { date: new Date('2023-09-01'), amount: 200, balance: 900 },
        ];
        const skippedTransactions = [];
        const wishlist = {
            wishlist_amount: '150',
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies',
            wishlist_date_available: '2023-08-15',
        };
        const fromDate = new Date('2023-06-01');

        generateWishlists(transactions, skippedTransactions, wishlist, fromDate);

        expect(transactions).toHaveLength(4);
        expect(skippedTransactions).toHaveLength(0);

        const wishlistTransaction = transactions.find(
            (t) => t.title === wishlist.wishlist_title
        );

        expect(wishlistTransaction).toBeDefined();
        expect(wishlistTransaction.amount).toBe(-150);
        expect(wishlistTransaction.date).toEqual(new Date('2023-08-15'));
    });
});
