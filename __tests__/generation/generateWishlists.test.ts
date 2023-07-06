import { GeneratedTransaction, Wishlist } from '../../types/types';
import generateWishlists from '../../generation/generateWishlists';
import MockDate from 'mockdate';

beforeAll(() => {
    MockDate.set('2023-01-01');
});

afterAll(() => {
    MockDate.reset();
});

describe('generateWishlists', () => {
    it('Should generate wishlist transaction', () => {
        const transactions: GeneratedTransaction[] = [
            { title: 'Wishlist test', description: 'A wishlist test', date: new Date('2023-07-01'), amount: 200, balance: 500 },
            { title: 'Another wishlist test', description: 'Yet another wishlist test', date: new Date('2023-08-01'), amount: 200, balance: 700 },
            { title: 'Third wishlist test', description: 'A third wishlist test', date: new Date('2023-09-01'), amount: 200, balance: 900 }
        ];
        const skippedTransactions: GeneratedTransaction[] = [];
        const wishlist: Wishlist = {
            wishlist_amount: 150,
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies'
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
        expect(wishlistTransaction.date).toEqual(new Date('2023-07-01'));
    });

    it('Should generate wishlist transaction with a date available set', () => {
        const transactions: GeneratedTransaction[] = [
            { title: 'First wishlist test', description: 'The first wishlist test', date: new Date('2023-07-01'), amount: 200, balance: 500 },
            { title: 'Second wishlist test', description: 'The second wishlist test', date: new Date('2023-08-01'), amount: 200, balance: 700 },
            { title: 'Third wishlist test', description: 'A third wishlist test', date: new Date('2023-09-01'), amount: 200, balance: 900 }
        ];
        const skippedTransactions: GeneratedTransaction[] = [];
        const wishlist: Wishlist = {
            wishlist_amount: 150,
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies',
            wishlist_date_available: '2023-08-15'
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

    it('Should generate wishlist transaction with negative balances in the future', () => {
        const transactions: GeneratedTransaction[] = [
            { title: 'First wishlist test', description: 'A first wishlist test', date: new Date('2023-07-01'), amount: 200, balance: 500 },
            { title: 'Second wishlist test', description: 'A second wishlist test', date: new Date('2023-07-15'), amount: -200, balance: 300 },
            { title: 'Third wishlist test', description: 'A third wishlist test', date: new Date('2023-08-01'), amount: 200, balance: 500 },
            { title: 'Fourth wishlist test', description: 'A fourth wishlist test', date: new Date('2023-09-01'), amount: 200, balance: 700 },
            { title: 'Fifth wishlist test', description: 'A fifth wishlist test', date: new Date('2023-10-01'), amount: 200, balance: 900 },
            { title: 'Sixth wishlist test', description: 'A sixth wishlist test', date: new Date('2023-11-01'), amount: 700, balance: 1600 },
            { title: 'Seventh wishlist test', description: 'A seventh wishlist test', date: new Date('2023-12-01'), amount: 500, balance: 2100 },
            { title: 'Eighth wishlist test', description: 'The eighth wishlist test', date: new Date('2024-01-01'), amount: -500, balance: 1600 },
            { title: 'Tenth wishlsit test', description: 'The tenth wishlist test', date: new Date('2024-02-01'), amount: 1000, balance: 2600 },
            { title: 'Eleventh wishlist test', description: 'The eleventh wishlist test', date: new Date('2024-03-01'), amount: -100, balance: 2500 }
        ];
        const skippedTransactions: GeneratedTransaction[] = [];
        const wishlist: Wishlist = {
            wishlist_amount: 2000,
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies'
        };
        const fromDate = new Date('2023-06-01');

        generateWishlists(transactions, skippedTransactions, wishlist, fromDate);

        expect(transactions).toHaveLength(11);
        expect(skippedTransactions).toHaveLength(0);

        const wishlistTransaction = transactions.find(
            (t) => t.title === wishlist.wishlist_title
        );

        expect(wishlistTransaction).toBeDefined();
        expect(wishlistTransaction.amount).toBe(-2000);
        expect(wishlistTransaction.date).toEqual(new Date('2024-02-01'));
    });

    it('Should generate wishlists correctly when the from date is greater than the wishlist date', () => {
        const transactions: GeneratedTransaction[] = [
            { title: 'First wishlist test', description: 'The first wishlist test', date: new Date('2023-07-01'), amount: 200, balance: 500 },
            { title: 'Second wishlist test', description: 'The second wishlist test', date: new Date('2023-08-01'), amount: 200, balance: 700 },
            { title: 'Third wishlist test', description: 'The third wishlist test', date: new Date('2023-09-01'), amount: 200, balance: 900 }
        ];
        const skippedTransactions: GeneratedTransaction[] = [];
        const wishlist: Wishlist = {
            wishlist_amount: 150,
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies'
        };
        const fromDate = new Date('2023-07-15');

        generateWishlists(transactions, skippedTransactions, wishlist, fromDate);

        expect(transactions).toHaveLength(3);
        expect(skippedTransactions).toHaveLength(1);

        const wishlistTransaction = transactions.find(
            (t) => t.title === wishlist.wishlist_title
        );

        expect(wishlistTransaction).toBeUndefined();
    });

    it('Should not generate wishlists when it can\'t be afforded', () => {
        const transactions: GeneratedTransaction[] = [
            { title: 'First wishlist test', description: 'The first wishlist test', date: new Date('2023-07-01'), amount: 200, balance: 500 },
            { title: 'Second wishlist test', description: 'The second wishlist test', date: new Date('2023-08-01'), amount: 200, balance: 700 },
            { title: 'Third wishlist test', description: 'Third wishlist test', date: new Date('2023-09-01'), amount: -200, balance: 500 }
        ];
        const skippedTransactions: GeneratedTransaction[] = [];
        const wishlist = {
            wishlist_amount: 1150,
            wishlist_title: 'New TV',
            wishlist_description: 'For watching movies'
        };
        const fromDate = new Date('2023-07-15');

        generateWishlists(transactions, skippedTransactions, wishlist, fromDate);

        expect(transactions).toHaveLength(3);
        expect(skippedTransactions).toHaveLength(0);

        const wishlistTransaction = transactions.find(
            (t) => t.title === wishlist.wishlist_title
        );

        expect(wishlistTransaction).toBeUndefined();
    });
});
