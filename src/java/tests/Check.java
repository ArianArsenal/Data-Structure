// Tiny test helpers: check() records failures, finish() reports and sets the exit code.
public final class Check {
    private static int failures = 0;

    private Check() {}

    public static void check(boolean cond, String what) {
        if (!cond) {
            System.err.println("CHECK failed: " + what);
            failures++;
        }
    }

    public static void finish(String name) {
        if (failures > 0) {
            System.err.println(name + ": " + failures + " failure(s)");
            System.exit(1);
        }
        System.out.println(name + ": OK");
    }
}
