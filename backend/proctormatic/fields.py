from rest_framework import serializers


class CustomCharField(serializers.CharField):
    def __init__(self, *args, **kwargs):
        self.default_error_messages = {
            'required': '{label}를 입력해주세요.',
            'blank': '{label}를 입력해주세요.',
            'invalid': '{label} 형식이 올바르지 않습니다.',
        }

        self.label = kwargs.get('label', None)
        if self.label is None:
            self.label = '값'

        if 'min_length' in kwargs:
            self.default_error_messages['min_length'] = f'{self.label}는 최소 {kwargs["min_length"]}자 이상이어야 합니다.'

        if 'max_length' in kwargs:
            self.default_error_messages['max_length'] = f'{self.label}는 최대 {kwargs["max_length"]}자 이하이어야 합니다.'

        if 'error_messages' in kwargs:
            self.default_error_messages.update(kwargs['error_messages'])

        kwargs['error_messages'] = self.default_error_messages
        super().__init__(*args, **kwargs)

    def run_validation(self, data=serializers.empty):
        error_messages = self.default_error_messages.copy()  # 새로운 사본 생성
        for key, msg in error_messages.items():
            if '{label}' in msg:
                error_messages[key] = msg.format(label=self.label)

        self.error_messages = error_messages

        return super().run_validation(data)

class CustomCharFieldWithConsonant(serializers.CharField):
    def __init__(self, *args, **kwargs):
        self.default_error_messages = {
            'required': '{label}을 입력해주세요.',
            'blank': '{label}을 입력해주세요.',
            'invalid': '{label} 형식이 올바르지 않습니다.',
        }

        self.label = kwargs.get('label', None)
        if self.label is None:
            self.label = '값'

        if 'min_length' in kwargs:
            self.default_error_messages['min_length'] = f'{self.label}은 최소 {kwargs["min_length"]}자 이상이어야 합니다.'

        if 'max_length' in kwargs:
            self.default_error_messages['max_length'] = f'{self.label}은 최대 {kwargs["max_length"]}자 이하이어야 합니다.'

        if 'error_messages' in kwargs:
            self.default_error_messages.update(kwargs['error_messages'])

        kwargs['error_messages'] = self.default_error_messages
        super().__init__(*args, **kwargs)

    def run_validation(self, data=serializers.empty):
        error_messages = self.default_error_messages.copy()
        for key, msg in error_messages.items():
            if '{label}' in msg:
                error_messages[key] = msg.format(label=self.label)

        self.error_messages = error_messages

        return super().run_validation(data)

class CustomEmailField(serializers.EmailField):
    default_error_messages = {
        'required': '이메일을 입력해주세요.',
        'blank': '이메일을 입력해주세요.',
        'invalid': '이메일 형식을 확인해주세요.',
    }

    def __init__(self, *args, **kwargs):
        if 'error_messages' in kwargs:
            self.default_error_messages.update(kwargs['error_messages'])
        kwargs['error_messages'] = self.default_error_messages
        super().__init__(*args, **kwargs)