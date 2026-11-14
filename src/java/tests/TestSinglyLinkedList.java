import static java.util.Arrays.asList;

public class TestSinglyLinkedList {
    public static void main(String[] args) {
        SinglyLinkedList l = new SinglyLinkedList(3, 7, 1);
        Check.check(l.toList().equals(asList(3, 7, 1)), "build");
        l.insertHead(5);
        l.insertTail(9);
        Check.check(l.toList().equals(asList(5, 3, 7, 1, 9)), "insert head/tail");
        Check.check(l.size() == 5, "size");

        SinglyLinkedList a = new SinglyLinkedList();
        a.insertTail(4);
        Check.check(a.toList().equals(asList(4)), "insert tail into empty");

        l = new SinglyLinkedList(3, 7, 1);
        l.insertAt(0, 0);
        l.insertAt(2, 5);
        l.insertAt(5, 8);
        Check.check(l.toList().equals(asList(0, 3, 5, 7, 1, 8)), "insertAt");
        boolean threw = false;
        try {
            l.insertAt(7, 1);
        } catch (IndexOutOfBoundsException e) {
            threw = true;
        }
        Check.check(threw, "insertAt out of range");

        l = new SinglyLinkedList(3, 7, 1, 7);
        Check.check(l.deleteValue(3), "delete head");
        Check.check(l.deleteValue(7), "delete middle");
        Check.check(l.toList().equals(asList(1, 7)), "after deletes");
        Check.check(!l.deleteValue(42), "delete missing");
        Check.check(l.deleteValue(7) && l.deleteValue(1) && !l.deleteValue(1), "delete to empty");
        Check.check(l.size() == 0, "size after deletes");

        l = new SinglyLinkedList(3, 7, 1);
        Check.check(l.search(3) == 0 && l.search(1) == 2 && l.search(4) == -1, "search");

        l = new SinglyLinkedList(1, 2, 3, 4);
        l.reverse();
        Check.check(l.toList().equals(asList(4, 3, 2, 1)), "reverse");

        Check.finish("SinglyLinkedList");
    }
}
