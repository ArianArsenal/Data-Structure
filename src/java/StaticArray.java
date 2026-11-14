// Fixed-capacity array with insert/delete by shifting.
// `// @step` / `// @op` markers drive the visualizer; see tools/build_code.js.
import java.util.Arrays;

public class StaticArray {
    private final int[] data = new int[8];
    private int size = 0;

    public StaticArray(int... values) {
        for (int v : values) insert(size, v);
    }

    // @op insert
    public void insert(int index, int value) {
        if (size == data.length) {                                     // @step check_full
            throw new IllegalStateException("array is full");          // @step full
        }
        if (index < 0 || index > size) {                               // @step check_bounds
            throw new IndexOutOfBoundsException("index out of range"); // @step out_of_range
        }
        int i = size;                   // @step start
        while (i > index) {             // @step loop
            data[i] = data[i - 1];      // @step shift
            i--;
        }
        data[index] = value;            // @step place
        size++;                         // @step done
    }
    // @endop

    // @op delete
    public int delete(int index) {
        if (index < 0 || index >= size) {                              // @step check_bounds
            throw new IndexOutOfBoundsException("index out of range"); // @step out_of_range
        }
        int removed = data[index];                // @step grab
        for (int i = index; i < size - 1; i++) {  // @step loop
            data[i] = data[i + 1];                // @step shift
        }
        size--;                                   // @step shrink
        data[size] = 0;                           // @step clear
        return removed;                           // @step done
    }
    // @endop

    // @op search
    public int search(int value) {
        for (int i = 0; i < size; i++) {  // @step loop
            if (data[i] == value) {       // @step compare
                return i;                 // @step found
            }
        }
        return -1;                        // @step not_found
    }
    // @endop

    public int[] toArray() {
        return Arrays.copyOf(data, size);
    }
}
