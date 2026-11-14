public class TestArrayStack {
    public static void main(String[] args) {
        ArrayStack s = new ArrayStack(1, 2, 3);
        Check.check(s.peek() == 3, "peek");
        s.push(4);
        Check.check(s.pop() == 4 && s.pop() == 3 && s.pop() == 2 && s.pop() == 1, "lifo");
        boolean threw = false;
        try { s.pop(); } catch (IllegalStateException e) { threw = true; }
        Check.check(threw, "underflow");
        ArrayStack full = new ArrayStack(0, 1, 2, 3, 4, 5, 6, 7);
        threw = false;
        try { full.push(8); } catch (IllegalStateException e) { threw = true; }
        Check.check(threw && full.size() == 8, "overflow");
        Check.finish("ArrayStack");
    }
}
