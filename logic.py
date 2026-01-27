class GUILogic:
    """منطق واجهة المستخدم الرسومية"""

    def __init__(self):
        self.gui_elements = {}
        self.user_interface_state = "idle"
        self.display_mode = "normal"

    def initialize_gui(self):
        """تهيئة واجهة المستخدم"""
        self.user_interface_state = "initialized"
        print("🖥️ تم تهيئة واجهة المستخدم بنجاح")

    def update_display(self, data):
        """تحديث عرض البيانات"""
        self.gui_elements['data'] = data
        print(f"📊 تم تحديث العرض: {data}")

    def handle_user_input(self, input_type, value):
        """معالجة إدخال المستخدم"""
        if input_type == "command":
            self.process_command(value)
        elif input_type == "data":
            self.update_display(value)

    def process_command(self, command):
        """معالجة الأوامر"""
        if command == "start":
            self.user_interface_state = "active"
        elif command == "stop":
            self.user_interface_state = "idle"
        print(f"⚙️ تم معالجة الأمر: {command}")

    def get_status(self):
        """الحصول على حالة النظام"""
        return {
            'state': self.user_interface_state,
            'mode': self.display_mode,
            'elements': len(self.gui_elements)
        }
