#include "../array_stack.h"

#include "check.h"

int main() {
    ArrayStack s({1, 2, 3});
    CHECK(s.peek() == 3);
    s.push(4);
    CHECK(s.pop() == 4 && s.pop() == 3 && s.pop() == 2 && s.pop() == 1);
    bool threw = false;
    try { s.pop(); } catch (const std::underflow_error&) { threw = true; }
    CHECK(threw);
    ArrayStack full({0, 1, 2, 3, 4, 5, 6, 7});
    threw = false;
    try { full.push(8); } catch (const std::overflow_error&) { threw = true; }
    CHECK(threw && full.size() == 8);
    return finish("array_stack");
}
